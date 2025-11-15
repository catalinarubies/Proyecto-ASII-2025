package services

import (
	"errors"
	"users-api/domain"
	"users-api/dto"
	"users-api/repositories"
	"users-api/utils"

	"gorm.io/gorm"
)

type UserService interface {
	CreateUser(userDTO dto.CreateUserDTO) (*dto.UserResponseDTO, error)
	GetUserByID(id uint) (*dto.UserResponseDTO, error)
	Login(loginDTO dto.LoginDTO) (*dto.LoginResponseDTO, error)
}

type userService struct {
	repo repositories.UserRepository
}

func NewUserService(repo repositories.UserRepository) UserService {
	return &userService{repo: repo}
}

func (s *userService) CreateUser(userDTO dto.CreateUserDTO) (*dto.UserResponseDTO, error) {
	// Verificar si el email ya existe
	existingUser, _ := s.repo.GetByEmail(userDTO.Email)
	if existingUser != nil {
		return nil, errors.New("email already exists")
	}

	// Hash de la contraseña
	hashedPassword, err := utils.HashPassword(userDTO.Password)
	if err != nil {
		return nil, errors.New("error hashing password")
	}

	// Crear usuario
	user := &domain.User{
		Name:     userDTO.Name,
		Email:    userDTO.Email,
		Password: hashedPassword,
	}

	err = s.repo.Create(user)
	if err != nil {
		return nil, errors.New("error creating user")
	}

	return &dto.UserResponseDTO{
		ID:    user.ID,
		Name:  user.Name,
		Email: user.Email,
	}, nil
}

func (s *userService) GetUserByID(id uint) (*dto.UserResponseDTO, error) {
	user, err := s.repo.GetByID(id)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, errors.New("user not found")
		}
		return nil, errors.New("error getting user")
	}

	return &dto.UserResponseDTO{
		ID:    user.ID,
		Name:  user.Name,
		Email: user.Email,
	}, nil
}

func (s *userService) Login(loginDTO dto.LoginDTO) (*dto.LoginResponseDTO, error) {
	// Buscar usuario por email
	user, err := s.repo.GetByEmail(loginDTO.Email)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, errors.New("invalid credentials")
		}
		return nil, errors.New("error during login")
	}

	// Verificar contraseña
	if !utils.CheckPassword(loginDTO.Password, user.Password) {
		return nil, errors.New("invalid credentials")
	}

	// Generar token JWT
	token, err := utils.GenerateJWT(user.ID, user.Email)
	if err != nil {
		return nil, errors.New("error generating token")
	}

	return &dto.LoginResponseDTO{
		Token: token,
		User: dto.UserResponseDTO{
			ID:    user.ID,
			Name:  user.Name,
			Email: user.Email,
		},
	}, nil
}
