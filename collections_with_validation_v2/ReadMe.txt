Hey guys, this is my revision of the database, I added validation to every collection
if you mongorestore this it should ensure that every
new or updated entry in the database follows a set schema 
if you have mongo compass you can go into the collections and then the validation tab and see each of the requirments
lmk if you can't, they should follow the data models we agreed on in the data assignment doc
here is an example of an insert to one of the game collections:
db.RockPaperScissors.insertOne({
    username: "user1",               // String
    Score: 123,                       // Integer
    timeElapsed: "12:34",             // String in MM:SS format
    timestamp: new Date("2025-04-09T17:21:00Z") // Date in ISO format
})
anything that does not fit this model will fail verification and will not be added to the database
the schema for all three game collections is the same but the users collection is different,
it takes a username, password, name, age, and email, only the email is special here,
it requires a "valid" email so it requires a structure like email@emial.com just any string wont cut it.
