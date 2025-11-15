package clients

import (
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"os"
	"time"
)

type UserResponse struct {
	ID    uint   `json:"id"`
	Name  string `json:"name"`
	Email string `json:"email"`
}

var httpClient = &http.Client{
	Timeout: 10 * time.Second,
}

func ValidateUser(userID uint) (*UserResponse, error) {
	usersAPIURL := os.Getenv("USERS_API_URL")
	if usersAPIURL == "" {
		return nil, fmt.Errorf("USERS_API_URL not configured")
	}

	url := fmt.Sprintf("%s/users/%d", usersAPIURL, userID)

	resp, err := httpClient.Get(url)
	if err != nil {
		return nil, fmt.Errorf("error calling users API: %v", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode == 404 {
		return nil, fmt.Errorf("user not found")
	}

	if resp.StatusCode != 200 {
		body, _ := io.ReadAll(resp.Body)
		return nil, fmt.Errorf("users API returned status %d: %s", resp.StatusCode, string(body))
	}

	var user UserResponse
	err = json.NewDecoder(resp.Body).Decode(&user)
	if err != nil {
		return nil, fmt.Errorf("error decoding user response: %v", err)
	}

	return &user, nil
}
