---
layout: post
title:  "Vim, Command-T and Git"
date: 2012-12-06 22:35:00
categories: vim
redirect_from: '/blog/1/'
---

One thing I've noticed a few developers do when using vim is to exit vim
(`:x`), cd into another directory, then `vim newfile`. There are **tons** of
better ways to navigate your file system - here's how I do it.

(Also, on a somewhat related: you can `ctrl-z` to suspend vim, then `fg` to
resume it. This comes in handy if you ever need to quickly run something on
the shell and resume editing.)

One better way to navigate through files is [NERD
Tree](http://www.vim.org/scripts/script.php?script_id=1658). NERD tree is a
popular vim plugin that opens up a text/tree representation of your directory
structure, allowing you to easily expand and explore files. Amusingly, NERD
tree was the first vim plugin I installed (it's not the first plugin I used,
though). I found it handy, but it often took too much time and effort to move
my arrow keys to the right file/folder and I found myself thinking too much
for it to be worthwhile. Developers change files **often**; you want to have
this happen as fast as possible.

Enter [Command-T](https://wincent.com/products/command-t). The live
demonstration screencast explains what it does, but TextMate users will be
familiar with the concept. Essentially, you launch the plugin, start typing and
the plugin will filter out files that don't match the keystrokes you've typed.
It's commonly known as "fuzzy finding". If, for example, I want to go to
`view/file.c`, I'd type `viewfi`, press enter, and `view/file.c` should open.
You no longer have to focus about directory structure so much as you need to
know what your files are called. Typically, I've found that I'm much better at
remembering the names of files and rapidly typing them, rather than exiting
Vim, navigating to the directory and opening the file.

Another really cool useful trick to use in conjunction with Command-T is
`<C-^>`. `<C-^>` goes to your last opened buffer, which is really useful if
you're editing two files simultaneously. I use it so much (also it's kind of an
awkward key-combination) that I've `nnoremap`'d it to `,,`.  I can't emphasize
enough how much productivity will increase if you switch to Command-T from
either NERD Tree or manual cd'ing.

Once you've Command-T'd into a folder, though, further Command-T's will start,
and be limited to the folder you're in (if you have `autochdir` set, at least).
You can easily `:!cd ..` and launch Command-T again, but we can do better...
If you use git like I do, you might find that you want to start Command-T from
the root of your git repository.

There are definitely better ways of implementing this, but here's what I've
done to resolve this problem:

(Update: I realize `git rev-parse --show-toplevel` would probably be a better
idea, but the script wasn't too difficult.)

#### find\_parent\_git
```bash
#!/bin/bash

# Finds the parent .git folder from where you currently are.
# i.e. if you're deep into the folders of a git repo that starts at
# "$HOME/git/config", findgit will echo "$HOME/git/config".
# I use this primarily for the Command-T vim plugin.

function find_parent_git() {
  local directory=$1

  cd $directory
  if [ -d "$directory"  ] && [ "$PWD" != "/" ]; then
    if [ -d "$directory/.git" ] ; then
      echo "$PWD"
    else
      find_parent_git "$directory/.."
    fi
  else
    echo "no parent git found"
  fi
}

find_parent_git $PWD
```

I've placed **find\_parent\_git** in $HOME/bin so I can call it from anywhere.

Next up, we change our `.vimrc`:

    function! FindParentGit()
      let x = system('find_parent_git')
      let x = substitute(x, '\n$', '', '') " removes the newline

      return x
    endfunction

    cnoremap %g <C-R>=FindParentGit()<cr>

This creates a vim function called `FindParentGit` that returns the folder of
the root parent git (or "no parent git found" if none exists).

The cnoremap makes it so that if you're in command-line mode, then type `%g`,
you'll output the directory of the root parent git. Now all we have left to do
is tell Command-T to start its fuzzy finding in that folder.

    map <leader>g :CommandTFlush<cr>\|:CommandT %g<cr>

One last tweak and it's almost perfect! If you're working in Java or in any
big project where there are a lot of files that you'd like to ignore, it can
slow you down to have to load them in Command-T (or incorrectly select them).
It'd be really cool if the `FindParentGit` function also filtered out files
that are under `.gitignore`. Here's my (admittedly flawed) version of the
function:

    function! FindParentGit(gitIgnore)
      let x = system('find_parent_git')
      let x = substitute(x, '\n$', '', '') " removes the newline

      " if we find no parent git, return .git
      " this is a little silly, but it means Command-T will react properly
      if x == "no parent git found"
        return ".git"
      endif

      " if the root folder contains a gitignore, let's add that to wildignore
      let filename = x . '/.gitignore'
      if filereadable(filename)
          let igstring = ''
          for oline in readfile(filename)
              let line = substitute(oline, '\s|\n|\r', '', "g")
              if line =~ '^#' | con | endif
              if line == '' | con  | endif
              if line =~ '^!' | con  | endif
              if line =~ '/$' | let igstring .= "," . line . "*" | con | endif
              let igstring .= "," . line
          endfor
          if a:gitIgnore == "true"
            let execstring = "set wildignore+=".substitute(igstring, '^,', '', "g")
          else
            " may be problematic in niche cases, for now it'll do
            let execstring = "set wildignore-=".substitute(igstring, '^,', '', "g")
          endif
          execute execstring
      endif

      return x
    endfunction

Our function now takes the `.gitignore` file into consideration when searching
(if it exists).  It's not perfect, it may act funny, but it should be good
enough for most uses. As you may have noticed, I added a boolean variable to
pass to the function that lets me decide whether or not I want to filter out
the `.gitignore` files.

The final result is the function you see above, as well as the auxiliary
macros:

    cnoremap %g <C-R>=FindParentGit("true")<cr>
    cnoremap %G <C-R>=FindParentGit("")<cr>

    map <leader>f :CommandTFlush<cr>\|:CommandT<cr>
    map <leader>F :CommandTFlush<cr>\|:CommandT $HOME<cr>
    map <leader>g :CommandTFlush<cr>\|:CommandT %g<cr>
    map <leader>G :CommandTFlush<cr>\|:CommandT %G<cr>

Go Command-T!
