# QCM

This project is a website used to create and share qcm from markdown. 

## Editing

You can create a new document using `Write a new document`

### Editor

On the left you will be able to write your markdown document.

You can use :

- `#?#` to create a new question
- `- [ ]` to create a wrong choice
- `- [X]` to create a valid choice

Then on the bottom you will be able to customize due paramaters :

- the quantity of available submitions
- the due date
- if the correction should be sent directly to the user

### Access

A QCM can have multiple access (one for each user it is sent to).

Accesses can be created by hand, start to write a new alias in the last row on the table.
They can also be createed using a csv file and choosing the columns and rows to create the alias

**Alias IS ONLY STORED LOCALLY** : The only data kept on the server is the submition, the server is unable to known the alias of the user. (Virtually they may never be any security breach as private data is not kept on the server computer)

Once Accesses are created the client will forever try to collect data when done you can export the data to analyse the results.

### Accessing User URL

User url can be accessed through an export, then you can use any sending system to give it to the students

## Results

Here's an example of the results exported into csv :

|Alias |Id                                  |Url                                                            |Submitted|0.0|0.1|0.2|1.0|1.1|1.2|1.3|
|------|------------------------------------|---------------------------------------------------------------|---------|---|---|---|---|---|---|---|
|Wyrdix|e4a49d61-4383-4b6e-9d7b-b90a977701d7|<http://localhost:5180/view/e4a49d61-4383-4b6e-9d7b-b90a977701d7>|X        |V  |   |   |V  |W  |M  |M  |
|Foo   |47abee26-b9c3-4224-a7d0-8274d3da5829|<http://localhost:5180/view/47abee26-b9c3-4224-a7d0-8274d3da5829>|         |M  |   |   |M  |   |M  |M  |

You can access the alias, id and url as said above.

You can see if the user submitted an answer.

Then for each answer you can see :

- V (VALID)  : if the answer was checked and is a valid answer
- M (MISSING): if the answer was not checked but was a valid answer
- W (WRONG)  : if the answer was checked and was not a valid answer
