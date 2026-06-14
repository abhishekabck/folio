// Studio configuration.
//
// The content repo MUST be public — the live site fetches its raw content.json with
// NO token. Only content.json lives there, so it being public is fine (no secrets).
// You can also override owner/repo/path/branch live inside the Studio UI.
export const studioConfig = {
  github: {
    owner: "abhishekabck",
    repo: "folio",
    path: "content.json",
    branch: "main",
  },

  // SHA-256 (hex) of the passphrase that unlocks the editor. Leave "" and the Studio
  // will run a one-time setup in your browser (it stores the hash in localStorage and
  // prints it so you can paste it back here — then the gate works on every device).
  // NOTE: this is a soft gate to keep casual visitors out; the REAL lock on publishing
  // is your GitHub token (only you have it). True server-enforced auth needs a backend.
  passHash: "f4aadb7f13f20e1e5f7b36b865c68df3c5da2fc06dc7c6c0e96c3eddea58d9a5",
};
