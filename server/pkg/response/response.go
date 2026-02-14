package response

import (
	"encoding/json"
	"fixora-server/pkg/apperrors"
	"net/http"
)

type APIResponse struct {
	Success bool        `json:"success"`
	Message string      `json:"message,omitempty"`
	Data    interface{} `json:"data,omitempty"`
	Error   interface{} `json:"error,omitempty"`
	Code    string      `json:"code,omitempty"`
}

func SendSuccess(w http.ResponseWriter, message string, data interface{}) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(APIResponse{
		Success: true,
		Message: message,
		Data:    data,
	})
}

func SendError(w http.ResponseWriter, statusCode int, message, code string) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(statusCode)
	json.NewEncoder(w).Encode(APIResponse{
		Success: false,
		Error:   message,
		Code:    code,
	})
}

func HandleError(w http.ResponseWriter, err error) {
	appErr := apperrors.ToAppError(err)
	SendError(w, appErr.StatusCode, appErr.Message, appErr.Code)
}
