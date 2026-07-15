# Research: `glpacman` and `glaur` Aliases in Omarchy

## Goal
Add `glpacman` and `glaur` aliases to `.bashrc` to bypass Omarchy-specific mirrors and repositories in favor of global Arch Linux mirrors.

## Findings
- **Current State**: The aliases are not defined in the system. `/etc/pacman.conf` and `/etc/pacman.d/mirrorlist` currently point to `https://pkgs.omarchy.org` and `https://stable-mirror.omarchy.org`.
- **Global Servers**: No "stock" Arch Linux `pacman.conf` or `mirrorlist` backup was found in `/etc/` or `~/.local/share/omarchy/`.
- **Omarchy Design**: Omarchy uses `omarchy refresh pacman` to enforce its own configurations.
- **AUR Helper**: `yay` is installed and available at `/usr/bin/yay`.

## Proposed Implementation (Paused)
To implement these without breaking the system's ability to update via Omarchy:
1. **Create Global Mirrorlist**: Generate a standard Arch Linux mirrorlist (using `reflector` if available, or manually) and save it to a non-conflicting location like `/etc/pacman.d/mirrorlist.global`.
2. **Create Global Config**: Create `/etc/pacman.global.conf` that excludes the `[omarchy]` repository and includes `mirrorlist.global`.
3. **Add Aliases**:
   - `alias glpacman='sudo pacman --config /etc/pacman.global.conf'`
   - `alias glaur='yay'` (AUR handles its own mirroring/builds usually).

## Next Steps
- Verify the contents of a "global" mirrorlist.
- Confirm if the user wants `glpacman` to permanently switch the system or just be a one-off command.
