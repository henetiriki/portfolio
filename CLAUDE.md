# CLAUDE.md

This file loads the project's conventions. It does not hold them.

The conventions live in [AGENTS.md](AGENTS.md), which is the cross-tool standard and the file to edit. This one exists because Claude Code loads `CLAUDE.md` automatically and would otherwise start a session with none of them — as happened while the Content Security Policy work was in progress, where `AGENTS.md` was only read because that session happened to go looking for it.

The second import is the documentation index rather than the documentation: `docs/` is roughly 250KB across 15 files, far too much to load into every session, while the index is small enough to always carry and says which doc covers what.

@AGENTS.md
@docs/README.md
