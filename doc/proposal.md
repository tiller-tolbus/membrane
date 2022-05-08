# Intro

Urbit is an OS, and any good OS needs a spreadsheet program. 

Like in many other domains, the native affordances of Urbit make it a promising platform in which to handle spreadsheet documents. The identity system allows for easy filesharing and collaboration, and Clay is an ideal environment for storing revisions to refer back to at later date. In addition, Hoon's text-parsing and virtualization affordances make it a promising environment for customizable spreadsheet functions. 

A fully fleshed out version of a spreadsheet app on the Urbit platform would be a powerful business logic machine capable of performing most of the tasks necessary to a small business without the need for sophisticated app development, with federated networking capabilities to handle complex interactions between multiple small businesses. Any spreadsheet, and the logic therein, could be transformed into a permissioned API as secure as Urbit itself, and serve as the database backbone for any number of applications.

This proposal is not an attempt to fully flesh out the capabilities of spreadsheets on Urbit in six months, but rather to lay the foundation for future development by producing a useful tool with the core necessary features of an Urbit-native spreadsheet, in order to accomodate Urbit-native businesses in greater capacity and to provide a concrete basis for what a "Google Sheets killer" app on Urbit should look like.

# Features

We are seeking to build a spreadsheet app capable of handling the basic data-related tasks of an individual or small business and to therein fully leverage the identity and networking capabilities of the Urbit platform. 

## Back-end

As per the Terraform design philsophy, we aim to make the back-end of `%cell` as agnostic as possible to front-end considerations. A spreadsheet in `%cell` serves as the ideal form of a spreadsheet in any context, and can be served to any front-end platform through the API.

### Persistence Model

*  A spreadsheet is a pair of `[meta data]` or metadata and spreadsheet data.
    * Metadata includes a title, a list of tags, and an ACL (access control list). ACLs are modeled after Google Sheets.
    * Data is a `(list row)` where a row is a `(list scell)` and a `scell` is a triple of `[meta code text]`. `meta` stores all necessary cell metadata, `code` stores what the user has actually input into the cell, and `text` stores what the user sees on the interface when `code` has been parsed and evaluated.
*  Spreadsheets are stored in the Clay filesystem and are revision controlled therein.
    * Users can use the revision control system to refer back to previous copies of their sheets and restore them. 

### API

#### Pokes

* Spawn a new sheet
* Accept invite to access sheet
* Change title of sheet
* Add/remove tags of sheet
* Edit ACL of sheet
* Flush and overwrite sheet with new data
* Change one row of sheet
* Change one cell of sheet
* Restore sheet to revision date

#### Scries

* Retrieve list of available sheets
* Retrieve list of sheet invites
* Retrieve entire sheet
* Retrieve sheet metadata
* Retrieve sheet data
* Retrieve specific row of sheet
* Retrieve specific column of sheet
* Retrieve specific cell of sheet
* Retrieve revision history of sheet

## Front-end

The front-end will be created with a combination of [React Grid](https://reactgrid.com/) and [FormulaJS](https://formulajs.info/).

### Home-Page

*  A menu of spreadsheets owned by a user, viewable as a list or grid
*  A sub-menu for viewing invites to view/edit spreadsheets outside of one's own grid
*  A sub-menu for viewing one's own app settings

### Spreadsheet Interface
* As per the demo, but more polished
* Functions from [FormulaJS](https://formulajs.info/) implemented in the front-end
* Sheets will automatically sync to owner's ship when an edit is performed
* While editing a sheet, a subscription will be maintained whereby new edits will appear to the user in real time, to the degree that the network speed allows
* Merge conflicts will be automatically arbitrated to favor the later edit
* Sub-menu for viewing edit history within a date range and applying a restore
* Users can create local copies of spreadsheets and export them to CSV files

# The Future of Spreadsheets on Urbit

In the future, we'd like to see the following things implemented on `%cell` to make it the killer app it should be. These are not part of the grant proposal, but we will design `%cell` with the implementation of these advanced features in mind.

* Real-time collaboration powered by remote scry or WebRTC
* Git-like conflict resolution interface
* Evaluation of spreadsheet functions such as SUM and RATE occur on back-end rather than front-end
    * Third party apps can thereby poke a spreadsheet with data and receive a subscription update containing the result of some resulting calculation
    * This may be paired with ACLs for each individual cell to provide a controlled interface to subscribers
    * With proper sandboxing, owners of sheets can implement their own custom sheet functions and allow editors to run those functions on their data
* Third party spreadsheet programs such as Excel, Google Sheets, and LibreOffice Calc should be able to remotely connect to an Urbit ship and interact with spreadsheets from a familiar interface.

# Terraform

Terraform is a two-man cohort of `~tiller-tolbus` and `~randes-losrep` that aims to become an Uqbar-native DAO with the express mission of Terraforming Mars for profit. This project is intended to bootstrap Terraform into presence on the platform and attract interest within the community to join us on our mission. Out of the 9-star bounty we are requesting for this project, 3 stars will be reserved to fund or enable future projects under this banner.

Our duo currently works by splitting the front-end and back-end considerations evenly. In simple terms, `~tiller-tolbus` works on Martian code, while `~randes-losrep` works on Terran code. 

As we are both remaining pseudonymous to whatever degree possible, we have developed a demo app showcasing our ability to write and distribute apps on Urbit.  

# The name %cell

We are open to suggestions for a different name for the app, as "cell" is already intended to mean a number of different things, most importantly the Hoon data structure. We chose %cell because we, like many other app developers on Urbit, like four-letter words with simple purposes. But we have not decided permanently on a name, and other suggestions are welcome.