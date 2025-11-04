package static

import (
	"net/http"
)

func Register(mux *http.ServeMux) {
	fs := http.FileServer(http.Dir("../dist"))
	mux.Handle("/", fs)
}
