### Backend Structure

* Directory hierarchy
* Paths ending in /hoon are code
* Anything underneath code is a todo or a done

---

* /app
    * /app/cell/hoon
        * ++state
        * ++on-init
        * ++on-save
        * ++on-load
        * ++on-poke
        * ++on-watch
        * ++on-peek
        * ++on-leave
        * ++on-agent
        * ++on-arvo
        * ++on-leave
* /mar
    * /mar/cell/sheet/hoon
        * ++grab
        * ++grow
        * ++grad
            * ++form
            * ++diff
            * ++pact
            * ++join
            * ++mash
* /lib
    * /lib/cell/hoon
        *  ++enjs-sheet
        *  ++dejs-sheet
* /sur
    * /sur/cell/hoon
        * +$ sheet
        * +$ row
        * +$ scell