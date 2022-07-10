# Dir Hierarchy (Example)

This dir hierarchy will work with the commands in the cheet sheet - feel free to modify on your own machine and adjust your use of the instructions accordingly.

*  bin
    *  (urbit binaries)
*  membrane
    *  (git repo)
    *  client
        * (frontend code)
    *  doc
        * (info)
    *  pkg
        * (backend code)
*  dead-zods
    * (dead zods go here or in the trash)
*  fresh
    * (contains one unused zod and a pill)
    * zod
    * multi.pill
*  urbit-git
    * (clone of github repo)
*  zod
    * (fake ship for testing)
    * membrane
        * (pkg files go here)

# Clone urbit-git
The main Urbit repo has some useful tools for developers, so keep a copy in your main directory.
```
git clone https://github.com/urbit/urbit urbit-git
 ```

# Fakezod & Pill

## Fresh zod and pill setup

### Pill

Keep a pill file in `fresh/` so that you don't have to download a new one in the event that you spawn a new fakezod.

```
cp urbit-git/bin/multi.pill fresh
```

### Fresh Zod
If you break your fakezod (likely) you can replace with this unused one.
```
./bin/urbit -F fresh/zod -B fresh/multi.pill
```
Wait for the Dojo prompt, then `CTRL+D` to exit the Dojo

## Cloning Fresh Zod
Use `{name}` to describe in brief what you were doing when your fakezod broke, in case you would like to try to troubleshoot it later.
```
mv zod dead-zods/{name}
cp -r fresh/zod .
```

# Build `%membrane` with fresh zod
These instructions will need to be updated later in the production process when the `pkg/` directory is more complete, so that we remove unnecessary files from the `%membrane` desk and use only what is required to build the app.

Earth:
```
./bin/urbit zod
```
Mars:
```
|merge %membrane our %base
|mount %membrane
```
Earth:
```
cp -r pkg/* zod/membrane
```
Mars:
```
|commit %membrane
|install our %membrane
|rein %membrane [& %membrane]
:membrane +dbug
```
The last command is to ensure that the app agent is receiving pokes. The demo agent should return `~`.