package supabase

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"mime/multipart"
	"net/http"
	"os"
	"strings"
)

func UploadToSupabase(fileHeader *multipart.FileHeader, bucketName string, filePath string) (string, error) {
	supabaseURL := os.Getenv("SUPABASE_URL")
	supabaseKey := os.Getenv("SUPABASE_SECRET_KEY")

	if supabaseURL == "" || supabaseKey == "" {
		return "", fmt.Errorf("supabase credentials are not set in .env")
	}

	file, err := fileHeader.Open()
	if err != nil {
		return "", fmt.Errorf("failed to open file: %v", err)
	}
	defer file.Close()

	fileBytes, err := io.ReadAll(file)
	if err != nil {
		return "", fmt.Errorf("failed to read file: %v", err)
	}

	contentType := fileHeader.Header.Get("Content-Type")
	if contentType == "" {
		contentType = "application/octet-stream"
	}

	apiURL := fmt.Sprintf("%s/storage/v1/object/%s/%s", supabaseURL, bucketName, filePath)

	req, err := http.NewRequest("POST", apiURL, bytes.NewReader(fileBytes))
	if err != nil {
		return "", fmt.Errorf("failed to create request: %v", err)
	}

	req.Header.Set("Authorization", "Bearer "+supabaseKey)
	req.Header.Set("apiKey", supabaseKey)
	req.Header.Set("Content-Type", contentType)
	req.Header.Set("x-upsert", "true")

	client := &http.Client{}
	resp, err := client.Do(req)
	if err != nil {
		return "", fmt.Errorf("failed to execute request: %v", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK && resp.StatusCode != http.StatusCreated {
		body, err := io.ReadAll(resp.Body)
		if err != nil {
			return "", fmt.Errorf("supabase error: %d (failed to read response body: %v)", resp.StatusCode, err)
		}
		return "", fmt.Errorf("supabase_error: %d - %s", resp.StatusCode, string(body))
	}

	publicURL := fmt.Sprintf("%s/storage/v1/object/public/%s/%s", supabaseURL, bucketName, filePath)
	return publicURL, nil
}

func GetSignedURL(bucketName string, filePath string, expiresInSeconds int) (string, error) {
	supabaseURL := strings.TrimRight(os.Getenv("SUPABASE_URL"), "/")
	supabaseKey := os.Getenv("SUPABASE_SERVICE_ROLE_KEY")

	if supabaseURL == "" || supabaseKey == "" {
		return "", fmt.Errorf("supabase credentials are not set")
	}

	apiURL := fmt.Sprintf("%s/storage/v1/object/sign/%s/%s", supabaseURL, bucketName, filePath)
	jsonBody := fmt.Sprintf(`{"expiresIn": %d}`, expiresInSeconds)

	req, err := http.NewRequest("POST", apiURL, bytes.NewBufferString(jsonBody))
	if err != nil {
		return "", err
	}

	req.Header.Set("Authorization", "Bearer "+supabaseKey)
	req.Header.Set("apiKey", supabaseKey)
	req.Header.Set("Content-Type", "application/json")

	client := &http.Client{}
	resp, err := client.Do(req)
	if err != nil {
		return "", err
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return "", fmt.Errorf("supabase error %d", resp.StatusCode)
	}

	var result struct {
		SignedURL string `json:"signedUrl"`
	}
	if err := json.NewDecoder(resp.Body).Decode(&result); err != nil {
		return "", err
	}

	fullSignedURL := result.SignedURL

	if !strings.HasPrefix(fullSignedURL, "http") {
		if strings.HasPrefix(fullSignedURL, "/object") {
			fullSignedURL = "/storage/v1" + fullSignedURL
		}
		fullSignedURL = supabaseURL + fullSignedURL
	}

	return fullSignedURL, nil
}
