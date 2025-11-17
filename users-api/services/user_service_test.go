package services

import (
	"errors"
	"testing"
	"users-api/domain"
	"users-api/dto"

	"gorm.io/gorm"
)

// Mock del UserRepository para testing
type mockUserRepository struct {
	users       map[uint]*domain.User
	emailIndex  map[string]*domain.User
	nextID      uint
	shouldError bool
}

func newMockUserRepository() *mockUserRepository {
	return &mockUserRepository{
		users:      make(map[uint]*domain.User),
		emailIndex: make(map[string]*domain.User),
		nextID:     1,
	}
}

func (m *mockUserRepository) Create(user *domain.User) error {
	if m.shouldError {
		return errors.New("database error")
	}

	user.ID = m.nextID
	m.nextID++

	m.users[user.ID] = user
	m.emailIndex[user.Email] = user

	return nil
}

func (m *mockUserRepository) GetByID(id uint) (*domain.User, error) {
	if m.shouldError {
		return nil, errors.New("database error")
	}

	user, exists := m.users[id]
	if !exists {
		return nil, gorm.ErrRecordNotFound
	}

	return user, nil
}

func (m *mockUserRepository) GetByEmail(email string) (*domain.User, error) {
	if m.shouldError {
		return nil, errors.New("database error")
	}

	user, exists := m.emailIndex[email]
	if !exists {
		return nil, gorm.ErrRecordNotFound
	}

	return user, nil
}

// Tests de CreateUser

func TestCreateUser_Success(t *testing.T) {
	// Arrange
	mockRepo := newMockUserRepository()
	service := NewUserService(mockRepo)

	userDTO := dto.CreateUserDTO{
		Name:     "Juan Perez",
		Email:    "juan@test.com",
		Password: "password123",
	}

	// Act
	result, err := service.CreateUser(userDTO)

	// Assert
	if err != nil {
		t.Errorf("Expected no error, got %v", err)
	}

	if result == nil {
		t.Fatal("Expected user result, got nil")
	}

	if result.Name != userDTO.Name {
		t.Errorf("Expected name %s, got %s", userDTO.Name, result.Name)
	}

	if result.Email != userDTO.Email {
		t.Errorf("Expected email %s, got %s", userDTO.Email, result.Email)
	}

	if result.ID == 0 {
		t.Error("Expected user ID to be set")
	}
}

func TestCreateUser_DuplicateEmail(t *testing.T) {
	// Arrange
	mockRepo := newMockUserRepository()
	service := NewUserService(mockRepo)

	// Crear primer usuario
	userDTO1 := dto.CreateUserDTO{
		Name:     "Juan Perez",
		Email:    "juan@test.com",
		Password: "password123",
	}
	service.CreateUser(userDTO1)

	// Intentar crear segundo usuario con mismo email
	userDTO2 := dto.CreateUserDTO{
		Name:     "Maria Garcia",
		Email:    "juan@test.com", // Email duplicado
		Password: "password456",
	}

	// Act
	result, err := service.CreateUser(userDTO2)

	// Assert
	if err == nil {
		t.Error("Expected error for duplicate email, got nil")
	}

	if err.Error() != "email already exists" {
		t.Errorf("Expected 'email already exists' error, got %v", err)
	}

	if result != nil {
		t.Error("Expected nil result for duplicate email")
	}
}

func TestCreateUser_RepositoryError(t *testing.T) {
	// Arrange
	mockRepo := newMockUserRepository()
	mockRepo.shouldError = true
	service := NewUserService(mockRepo)

	userDTO := dto.CreateUserDTO{
		Name:     "Juan Perez",
		Email:    "juan@test.com",
		Password: "password123",
	}

	// Act
	result, err := service.CreateUser(userDTO)

	// Assert
	if err == nil {
		t.Error("Expected error from repository, got nil")
	}

	if result != nil {
		t.Error("Expected nil result on repository error")
	}
}

// Tests de GetUserByID

func TestGetUserByID_Success(t *testing.T) {
	// Arrange
	mockRepo := newMockUserRepository()
	service := NewUserService(mockRepo)

	// Crear usuario primero
	createDTO := dto.CreateUserDTO{
		Name:     "Juan Perez",
		Email:    "juan@test.com",
		Password: "password123",
	}
	created, _ := service.CreateUser(createDTO)

	// Act
	result, err := service.GetUserByID(created.ID)

	// Assert
	if err != nil {
		t.Errorf("Expected no error, got %v", err)
	}

	if result == nil {
		t.Fatal("Expected user result, got nil")
	}

	if result.ID != created.ID {
		t.Errorf("Expected ID %d, got %d", created.ID, result.ID)
	}

	if result.Email != created.Email {
		t.Errorf("Expected email %s, got %s", created.Email, result.Email)
	}
}

func TestGetUserByID_NotFound(t *testing.T) {
	// Arrange
	mockRepo := newMockUserRepository()
	service := NewUserService(mockRepo)

	// Act
	result, err := service.GetUserByID(999) // ID que no existe

	// Assert
	if err == nil {
		t.Error("Expected error for non-existent user, got nil")
	}

	if err.Error() != "user not found" {
		t.Errorf("Expected 'user not found' error, got %v", err)
	}

	if result != nil {
		t.Error("Expected nil result for non-existent user")
	}
}

func TestGetUserByID_RepositoryError(t *testing.T) {
	// Arrange
	mockRepo := newMockUserRepository()
	mockRepo.shouldError = true
	service := NewUserService(mockRepo)

	// Act
	result, err := service.GetUserByID(1)

	// Assert
	if err == nil {
		t.Error("Expected error from repository, got nil")
	}

	if result != nil {
		t.Error("Expected nil result on repository error")
	}
}

// Tests de Login

func TestLogin_Success(t *testing.T) {
	// Arrange
	mockRepo := newMockUserRepository()
	service := NewUserService(mockRepo)

	password := "password123"

	// Crear usuario primero
	createDTO := dto.CreateUserDTO{
		Name:     "Juan Perez",
		Email:    "juan@test.com",
		Password: password,
	}
	service.CreateUser(createDTO)

	// Login
	loginDTO := dto.LoginDTO{
		Email:    "juan@test.com",
		Password: password,
	}

	// Act
	result, err := service.Login(loginDTO)

	// Assert
	if err != nil {
		t.Errorf("Expected no error, got %v", err)
	}

	if result == nil {
		t.Fatal("Expected login result, got nil")
	}

	if result.Token == "" {
		t.Error("Expected JWT token, got empty string")
	}

	if result.User.Email != loginDTO.Email {
		t.Errorf("Expected email %s, got %s", loginDTO.Email, result.User.Email)
	}
}

func TestLogin_InvalidEmail(t *testing.T) {
	// Arrange
	mockRepo := newMockUserRepository()
	service := NewUserService(mockRepo)

	loginDTO := dto.LoginDTO{
		Email:    "nonexistent@test.com",
		Password: "password123",
	}

	// Act
	result, err := service.Login(loginDTO)

	// Assert
	if err == nil {
		t.Error("Expected error for invalid email, got nil")
	}

	if err.Error() != "invalid credentials" {
		t.Errorf("Expected 'invalid credentials' error, got %v", err)
	}

	if result != nil {
		t.Error("Expected nil result for invalid credentials")
	}
}

func TestLogin_InvalidPassword(t *testing.T) {
	// Arrange
	mockRepo := newMockUserRepository()
	service := NewUserService(mockRepo)

	// Crear usuario
	createDTO := dto.CreateUserDTO{
		Name:     "Juan Perez",
		Email:    "juan@test.com",
		Password: "correctpassword",
	}
	service.CreateUser(createDTO)

	// Intentar login con contraseña incorrecta
	loginDTO := dto.LoginDTO{
		Email:    "juan@test.com",
		Password: "wrongpassword",
	}

	// Act
	result, err := service.Login(loginDTO)

	// Assert
	if err == nil {
		t.Error("Expected error for invalid password, got nil")
	}

	if err.Error() != "invalid credentials" {
		t.Errorf("Expected 'invalid credentials' error, got %v", err)
	}

	if result != nil {
		t.Error("Expected nil result for invalid credentials")
	}
}

func TestLogin_RepositoryError(t *testing.T) {
	// Arrange
	mockRepo := newMockUserRepository()
	mockRepo.shouldError = true
	service := NewUserService(mockRepo)

	loginDTO := dto.LoginDTO{
		Email:    "juan@test.com",
		Password: "password123",
	}

	// Act
	result, err := service.Login(loginDTO)

	// Assert
	if err == nil {
		t.Error("Expected error from repository, got nil")
	}

	if result != nil {
		t.Error("Expected nil result on repository error")
	}
}

// Test para verificar que las contraseñas se hashean correctamente
func TestCreateUser_PasswordIsHashed(t *testing.T) {
	// Arrange
	mockRepo := newMockUserRepository()
	service := NewUserService(mockRepo)

	plainPassword := "myplainpassword"
	userDTO := dto.CreateUserDTO{
		Name:     "Juan Perez",
		Email:    "juan@test.com",
		Password: plainPassword,
	}

	// Act
	result, err := service.CreateUser(userDTO)

	// Assert
	if err != nil {
		t.Fatalf("Expected no error, got %v", err)
	}

	// Verificar que la contraseña está hasheada en el repositorio
	storedUser := mockRepo.users[result.ID]

	if storedUser.Password == plainPassword {
		t.Error("Password should be hashed, not stored in plain text")
	}

	if len(storedUser.Password) < 50 {
		t.Error("Hashed password seems too short, might not be properly hashed")
	}
}
