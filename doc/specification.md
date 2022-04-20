### Demo

* Spreadsheet with text cells that syncs to Urbit ship
* State is a single sheet with no metadata
* Sheet spec:
    * A sheet is an ordered list of rows
    * A row is an ID and a list of cells
    * A cell is a string
* API is one scry and one poke:
    * Scry retrieves entire sheet
    * Poke sends entire sheet
* User can add text to cells and sync to their ship

### Final

* State is a preferences config, a whitelist, and a directory
* A sheet can either be locally owned or shared from another ship
* Config Spec:
    * A config is a map of settings to options
        * As of now no user settings are specified, but requests from users are anticipated
* Directory Spec:
    * A directory is set of triples of sheet, owner, and access level `(list [sheet owner access])`
* Whitelist Spec:
    * A whitelist is a map of Urbit ID to access group `(map @p ax-group)`
    * An access group is a map of sheet to access level `(map @p ax-level)`
    * An access level is as follows: `$:(%read %edit %share %admin)`
        * `%read` access allows the user to view the sheet and create a local copy
        * `%edit` allows the user to make changes to the data (not metadata) of the host copy
        * `%share` allows the user to give `%read` or `%edit` access to other users on the host copy
        * `%admin` allows the user to make any change to the data or metadata of the host copy
* Sheets Spec:
    * A sheet is a pair of data and metadata `[data meta]`
    * Data Spec:
        * A data is a list of rows `(list row)`
        * A row is an ID and a list of cells `[id (list scell)]`
        * A cell is a cord `@t`
        * The back-end will enforce sensible limits on the size of sheets, rows, and cells
        * The front-end will also enforce these limits where possible
    * Metadata Spec:
        * A metadata is a title, an owner, a list of tags, and an edit log
            * `[title=@t owner=@p tags=(list tag) log=(mop edit)]`
        * A tag is a URL-safe knot `@ta`
        * An edit is a timestamp, Urbit ID, and an action summary
            * `[timestmap=@da user=@p summary=@t]`
* API Spec:
    * Scries:
        * Retrieve preferences
        * Retrieve whitelist subset for specific sheet
        * Directory Retrieval
            * Retrieve entire directory
            * Retrieve directory by search string
                * Searches titles and tags but not content
        * Data Retrieval
            * Retrieve all rows
            * Retrieve diff between current sheet and remote sheet[^diff-tentative]
        * Metadata Retrieval
            * Retrieve entire edit history
            * Retrieve edit history from timestamp to timestamp
    * Pokes:
        * Prefereces Modification
            * Modify preference values
        * Whitelist Modification
            * Share sheet w/ permission level (add user to access group)
            * Share sheet with group (all members of group gain access)
            * Unshare sheet (remove user from access group and kick subscriber)
        * Directory Modification
            * Create Spreadsheet
            * Delete Spreadsheet
                * If owner, destroys the spreadsheet
                * If not owner, unsubscribes from host
            * Request Spreadsheet
                * Attempts to subscribe to spreadsheet at path
        * Spreadsheet Modification
            * Edit Cell (replace with new value)
            * Delete Cell (replace with no value)
            * Add Row (promote id# of all subsequent rows)
            * Delete Row (remove data & demote id# of all subsequent rows)
            * Add column (insert cell into all rows)
            * Delete column (delete cell from all rows)
            * Undo (tentative)[^diff-tentative]
                * Undo most recent action
                * Undo up to specific timestamp
* Front-End
    * 

### Wishlist

* Export to CSV
* Integration with Clay filesystem
    * Sufficient ++grad functionality to diff and merge efficiently
    * Implement undo[^diff-tentative]
* Arbitrary Hoon gates can be saved as sandboxed generators and called from the GUI inside a cell
    * This is the cool way to do spreadsheet functions on Urbit
    * Include some standard library of default functions that ship with the app
    * A cell is now a pair of values, the input string and the output text
    * Generators are saved in the /gen directory of the %cell desk
* Real-time collaborative editing with WebRTC
    * As of this writing WebRTC is premature
    * Even with mature WebRTC, this would be a tough engineering feat

[^diff-tentative]: This feature depends on how well we are able to implement `diff`ing changes to sheets. Not impossible on Urbit but may require greater resource allocation.