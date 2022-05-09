# Intro

Urbit is an OS, and any good OS needs a spreadsheet program. 

Like in many other domains, the native affordances of Urbit make it a promising platform in which to handle spreadsheet documents. The identity system allows for easy filesharing and collaboration, and Clay is an ideal environment for storing revisions to refer back to at later date. In addition, Hoon's text-parsing and virtualization affordances make it a promising environment for customizable spreadsheet functions. 

A fully fleshed out version of a spreadsheet app on the Urbit platform would be a powerful business logic machine capable of performing most of the tasks necessary to a small business without the need for sophisticated app development, with federated networking capabilities to handle complex interactions between multiple small businesses. Any spreadsheet, and the logic therein, could be transformed into a permissioned API as secure as Urbit itself, and serve as the database backbone for any number of applications.

This proposal an attempt to lay the foundation for future development by producing a useful tool with the core necessary features of an Urbit-native spreadsheet, in order to accomodate Urbit-native businesses in greater capacity and to provide a concrete basis for what a "Google Sheets killer" app on Urbit should look like.

# Timeline

## Milestone 0: Proof of Concept

Expected Completion: Finished

Payment: None

Our demo has shipped and can be found at `~mister-master-tiller-tolbus/cell`. It is a one-spreadsheet app that can sync its spreadsheet to the user's ship. This is a proof of concept that we can make a spreadsheet application on Urbit.

## Milestone 1

Expected Completion: September 2022

Payment: 2 stars

*  I can create spreadsheets through `%cell` that are saved to my ship's filesystem through Clay and revision controlled therein.
*  I can view a selection of all of the spreadsheets I have access to from the homepage.
*  I can view the homepage as a list or a grid and sort spreadsheets by title, tags, or date modified.
*  I can give my spreadsheets a title, and a list of metadata tags.
*  I can customize the appearance of cells within my sheets by changing the format of the text or the color of the background.
*  I can perform basic arithmetic by referencing other cells, such as `=(A1+B2)`. Basic arithmetic includes addition, subtraction, multiplication, division, and tests for equality.
*  I can insert rows and columns into my spreadsheet by right-clicking on the column or row header.
*  I can share my spreadsheets with my pals. This sends them an invite where they can accept my spreadsheet and create a local copy of it on their ship.

## Milestone 2:

Expected Completion: November 2022

Payment: 3 stars

* I can organize my spreadsheets into folders that are visible from my homepage.
* I can view an edit history of the sheet I'm working on and revert back to an arbitrary date.
* I can use any formula from the [Formula.JS](https://formulajs.info/) library to reference other cells within my sheet, and have those formulas automatically update when their referenced cells change.
* I can select a group of consecutive cells and copy-paste them into another group of consecutive cells.
* I can search my spreadsheet, or a selection within my spreadsheet, for a pattern of characters, and perform find/replace within my search.
* I can select a group of cells matching a pattern such as `A1 = 1, A2 = 2, A3 = 3...` and drag so that the following cells follow the pattern, ex. `A4 = 4, A5 = 5...`.
* I can export my spreadsheets to CSV format and download them onto my Terran computer.
* I can read about the features of `%cell` by looking at its page in the `Documentation` app.
* My spreadsheets expose an API that can be accessed by third-party front-ends, as well as other Urbit apps. All pokes and scries are documented in the `Documentation` app.

# The Future of Spreadsheets on Urbit

In the future, we'd like to see the following things implemented on `%cell` to make it the killer app it should be. These are not part of the grant proposal, but we will design `%cell` with the implementation of these advanced features in mind.

* Real-time collaboration powered by remote scry or WebRTC
* Evaluation of spreadsheet functions such as SUM and RATE occur on back-end rather than front-end
    * Third party apps can thereby poke a spreadsheet with data and receive a subscription update containing the result of some resulting calculation
    * This may be paired with ACLs for each individual cell to provide a controlled interface to subscribers
    * With proper sandboxing, owners of sheets can implement their own custom sheet functions and allow editors to run those functions on their data
* Users should be able to link together spreadsheets that they have access to and reference data within each other, creating complex relational schemes.
* Third party spreadsheet programs such as Excel, Google Sheets, and LibreOffice Calc should be able to remotely connect to an Urbit ship and interact with spreadsheets from a familiar interface.

# Terraform

Terraform is a two-man cohort of `~tiller-tolbus` and `~randes-losrep` that aims to become an Uqbar-native DAO with the express mission of Terraforming Mars for profit. This project is intended to bootstrap Terraform into presence on the platform and attract interest within the community to join us on our mission. Out of the 5-star bounty we are requesting for this project, 2 stars will be reserved to fund or enable future projects under this banner.

Our duo currently works by splitting the front-end and back-end considerations evenly. In simple terms, `~tiller-tolbus` works on Martian code, while `~randes-losrep` works on Terran code. 

As we are both remaining pseudonymous to whatever degree possible, we have developed a demo app showcasing our ability to write and distribute apps on Urbit.  

# The name %cell

We are open to suggestions for a different name for the app, as "cell" is already intended to mean a number of different things, most importantly the Hoon data structure. We chose `%cell` because we, like many other app developers on Urbit, like four-letter words with simple purposes. But we have not decided permanently on a name, and other suggestions are welcome.