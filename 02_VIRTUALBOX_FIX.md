# Problem: VirtualBox Kernel Modules Not Loaded

## Issue
Running `virtualbox` failed with:
`WARNING: The vboxdrv kernel module is not loaded.`

## Diagnosis
- Kernel version: `7.0.9-arch2-1`
- `virtualbox-host-dkms` was installed, but the modules weren't built.
- `linux-headers` was missing, which is required for DKMS to build kernel modules.
- User `mhy` was not in the `vboxusers` group.

## Solution
1. **Install Linux Headers**: `sudo pacman -S linux-headers` (matched to kernel version `7.0.9.arch2-1`).
2. **Build Modules**: DKMS automatically triggered the build of `vboxhost/7.2.8_OSE` during the headers installation.
3. **Load Modules**:
   - `sudo modprobe vboxdrv`
   - `sudo modprobe vboxnetadp`
   - `sudo modprobe vboxnetflt`
4. **Group Permissions**: Added user to group: `sudo usermod -aG vboxusers mhy`.

## Verification
- `lsmod | grep vbox` confirmed `vboxdrv`, `vboxnetadp`, and `vboxnetflt` are loaded.
- `vboxusers` group membership added (requires logout/login to take effect).
