package web

import (
	"net/http"

	"github.com/asheshgoplani/agent-deck/internal/session"
)

// handlePathSuggestions serves filesystem directory completions using the same
// helper as the TUI. It returns paths only, never file contents or metadata.
func (s *Server) handlePathSuggestions(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		writeAPIError(w, http.StatusMethodNotAllowed, ErrCodeMethodNotAllowed, "method not allowed")
		return
	}
	if !s.authorizeRequest(r) {
		writeAPIError(w, http.StatusUnauthorized, ErrCodeUnauthorized, "unauthorized")
		return
	}

	const maxSuggestions = 20
	paths, err := session.GetDirectoryCompletions(r.URL.Query().Get("prefix"))
	if err != nil || paths == nil {
		paths = []string{}
	}
	if len(paths) > maxSuggestions {
		paths = paths[:maxSuggestions]
	}
	w.Header().Set("Cache-Control", "no-store")
	writeJSON(w, http.StatusOK, struct {
		Suggestions []string `json:"suggestions"`
	}{Suggestions: paths})
}
