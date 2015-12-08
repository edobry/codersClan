var cheerio = require("cheerio"),
    fs = require("fs"),
    stringify = require("csv-stringify");

var table = fs.readFileSync("table");

var $ = cheerio.load(table);

var headers = ["Year", "Album", "Artist", "Credit"];

var rows = $("tbody tr").map((i, row) => 
    [$(row).children().map((i, cell) => 
        $(cell).text().trim()
    ).get()]
).get();

var things = rows.map(row =>
    row.map((val, i) => [headers[i], val])
        .reduce((out, cell) => { 
            out[cell[0]] = cell[1]
            return out;
        }, {})
);

stringify([headers, ...rows], (err, out) =>
    fs.writeFile("out.csv", out, err => {
        if(err) {
                console.log("Error: ", err);
                process.exit(1);
            }

        console.log("file written!");
    })
);
