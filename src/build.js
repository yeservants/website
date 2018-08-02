const config = require('./config.json');
const glob = require('glob');
const fs = require('fs');
const ncp = require('ncp').ncp;
var date = new Date();
ncp.limit = 16;

rmDir = function (dirPath, removeSelf) {
    if (removeSelf === undefined)
        removeSelf = true;
    try { var files = fs.readdirSync(dirPath); }
    catch (e) { return; }
    if (files.length > 0)
        for (var i = 0; i < files.length; i++) {
            var filePath = dirPath + '/' + files[i];
            if (fs.statSync(filePath).isFile())
                fs.unlinkSync(filePath);
            else
                rmDir(filePath);
        }
    if (removeSelf)
        fs.rmdirSync(dirPath);
};

rmDir(__dirname + '/../public', false);


var missionariesdata = "";

let mdir = __dirname + '/../public/missionary';
if (!fs.existsSync(mdir)){
    fs.mkdirSync(mdir);
}

//Replace variables
let baseURL = config.site.baseURL;
let siteName = config.site.name;
let address = config.site.address;
let phone = config.site.phone;
let sitedescription = config.site.description;
let copyrightStart = config.site.copyright;
let copyrightEnd = date.getFullYear();


glob(__dirname + '/missionaries/*.js', {recursive: false}, (err, files) => {
    if (err) console.error(err);
    console.log(`Processing Missionaries (${files.length} found)`);
    files.forEach(f => {
        let m = require(`${f}`);
        let tmp = fs.readFileSync(__dirname + '/templates/missionary.html', "utf8");

        console.log(`Loading Missionary: ${m.info.name}.`);

        //missionary variables
        let name = m.info.name;
        let description = m.info.description;
        let location = m.info.location;
        let missionaryURL = m.info.url;
        let picture = m.info.picture;
        let contact = "";
        let donationURL = `${baseURL}donate?missionary=${encodeURIComponent(name)}`;
        let bio = `<b>Location:</b> ${location}\n${m.bio()}`;
        
        let c = m.info.contact;
        for (var key in c) {
            if (c.hasOwnProperty(key)) {
                switch(key) {
                    case'email':
                        let etemp = "";
                        c[key].split('').forEach(function(ch) {
                            etemp += `<span>${ch}</span>`;
                        });
                        contact += etemp;
                        break;
                    case 'address':
                        let ar = c[key];
                        for(i=0; i<ar.length; i++) {
                            contact += ar[i];
                        }
                        break;
                    case 'phone':
                        let ptemp = "";
                        c[key].split('').forEach(function(ph) {
                            ptemp += `<span>${ph}</span>`;
                        });
                        contact += ptemp;
                        break;
                    case 'link':
                        contact += `<a href="${c[key]}" rel="nofollow">${c[key]}</a>`;
                        break;
                    default:
                        break;
                }
            }
        };

        missionariesdata = missionariesdata + `<div class="missionaryitem">
            <a href="${baseURL}missionary/${missionaryURL}" alt="${name}">
                <img src="${baseURL}images/${picture}" alt="${name}'s picture" class="full">
                <b>${name}</b><br />
                ${location}
            </a>
        </div>`;

        tmp = tmp.replace(/{{baseURL}}/g, baseURL)
            .replace(/{{siteName}}/g, siteName)
            .replace(/{{address}}/g, address)
            .replace(/{{phone}}/g, phone)
            .replace(/{{copyrightStart}}/g, copyrightStart)
            .replace(/{{copyrightEnd}}/g, copyrightEnd)
            .replace(/{{name}}/g, name)
            .replace(/{{description}}/g, description)
            .replace(/{{missionaryURL}}/g, missionaryURL)
            .replace(/{{picture}}/g, picture)
            .replace(/{{contact}}/g, contact)
            .replace(/{{donationURL}}/g, donationURL)
            .replace(/{{bio}}/g, bio)

        let ndir = `${mdir}/${missionaryURL}`;
        if (!fs.existsSync(ndir)){
            fs.mkdirSync(ndir);
        }

        fs.writeFileSync(`${ndir}/index.html`, tmp, function (err) {
            if (err) throw err;
            console.log('Missionary Saved!');
        });
    });
    let msdir = __dirname + '/../public/missionaries';
    if (!fs.existsSync(msdir)){
        fs.mkdirSync(msdir);
    }
    let mstmp = fs.readFileSync(__dirname + '/templates/missionaries.html', "utf8");
    //console.log("data: " + missionariesdata);
    mstmp = mstmp.replace(/{{baseURL}}/g, baseURL)
                    .replace(/{{siteName}}/g, siteName)
                    .replace(/{{address}}/g, address)
                    .replace(/{{phone}}/g, phone)
                    .replace(/{{copyrightStart}}/g, copyrightStart)
                    .replace(/{{copyrightEnd}}/g, copyrightEnd)
                    .replace(/{{description}}/g, sitedescription)
                    .replace(/{{missionaries}}/g, missionariesdata)

    fs.writeFileSync(__dirname + `/../public/missionaries/index.html`, mstmp, function (err) {
        if (err) throw err;
        console.log('Missionaries Page Saved!');
    });
});







let hometmp = fs.readFileSync(__dirname + '/templates/index.html', "utf8");
hometmp = hometmp.replace(/{{baseURL}}/g, baseURL)
                .replace(/{{siteName}}/g, siteName)
                .replace(/{{address}}/g, address)
                .replace(/{{phone}}/g, phone)
                .replace(/{{copyrightStart}}/g, copyrightStart)
                .replace(/{{copyrightEnd}}/g, copyrightEnd)
                .replace(/{{description}}/g, sitedescription)
                .replace(/{{startedAgo}}/g, copyrightEnd-copyrightStart)
fs.writeFileSync(__dirname + `/../public/index.html`, hometmp, function (err) {
    if (err) throw err;
    console.log('Homepage Saved!');
});


let redir = __dirname + '/../public/missionary';
if (!fs.existsSync(redir)){
    fs.mkdirSync(redir);
}
let retmp = fs.readFileSync(__dirname + '/templates/missionary-redirect.html', "utf8");
console.log("data: " + missionariesdata);
retmp = retmp.replace(/{{baseURL}}/g, baseURL)
                .replace(/{{siteName}}/g, siteName)

fs.writeFileSync(__dirname + `/../public/missionary/index.html`, retmp, function (err) {
    if (err) throw err;
    console.log('Missionaries Page Saved!');
});



//copy over static files
ncp(__dirname + '/static', __dirname + '/../public', function (err) {
    if (err) {
        return console.error(err);
    }
});


console.log('completed.');