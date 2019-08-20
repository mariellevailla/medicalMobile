

function GET(url, callback) {
    var xhttp;
    xhttp = new XMLHttpRequest();
    xhttp.open("GET", url, true);
    xhttp.setRequestHeader("Accept", "*/*")
    xhttp.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
            callback(this);
        }
    };
    xhttp.send();
}

function getadd(attribute, callback){
	var amount = GET('http://localhost:9090/addpatient/?testParam=' + attribute, callback)
}

function getquery(attribute, callback){
	var amount = GET('http://localhost:9090/query/?testParam=' + attribute, callback)
}

function getinvoke(attribute, callback){
	var amount = GET('http://localhost:9090/invoke/?testParam=' + attribute, callback)
}

function POST(auth, params, url, callback) {
    var xhttp;
    xhttp = new XMLHttpRequest();
    xhttp.open("POST", url, true);
    xhttp.setRequestHeader("Authorization", "Basic " + btoa(auth))
    xhttp.setRequestHeader('Content-Type', 'application/json')
    xhttp.setRequestHeader("Accept", "*/*")
    xhttp.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
            callback(this);
        }
    };
    xhttp.send(params);
}

function boutonPatient(){
    window.location = 'addPatientApp.html';
}

function boutonQuery() {
    window.location = 'queryApp.html';
}

function boutonInvoke() {
    window.location = 'invokeApp.html';
}

function testAlertClient(){

   getadd('Marielle', function(res){
        alert(JSON.parse(res.response).Nom)
   })    
}

function addPatient() {

    let Patient = {};
    Patient.Nom = document.getElementById('nom').value;
    Patient.Prenom = document.getElementById('prenom').value;
    Patient.NumeroAssurance = document.getElementById('numeroAssurance').value;
    Patient.Institution = document.getElementById('Institution').value;
    Patient.dossier = {};

    Patient = JSON.stringify(Patient);

    //générer des clées
    var publicKey = generateKeypair();
    publicKey = publicKey.replace(/(\r\n|\n|\r)/gm, "");
    let key = exportKeys(publicKey);
    privateKey = key.privateKey.replace(/(\r\n|\n|\r)/gm, "");
    
    //crypter le dossier
    var encryptedData = encrypt(Patient, publicKey);

    let args = [];
        args[0] = publicKey;
        args[1] = encryptedData;

    const buffer = JSON.stringify(args);

    getadd(buffer, function(res) {
         if(res.status == 200){              
        
        var pub_string = JSON.stringify(publicKey, undefined, 2);
        var link = document.createElement('a');
        link.download = 'pub.json';
        var blob = new Blob([pub_string], {type: 'text/plain'});
        link.href = window.URL.createObjectURL(blob);
        link.click();

        var priv_string = JSON.stringify(privateKey, undefined, 2);
        var link = document.createElement('a');
        link.download = 'priv.json';
        var blob = new Blob([priv_string], {type: 'text/plain'});
        link.href = window.URL.createObjectURL(blob);
        link.click();
        } 
    });

    }
   
    

function query() {
    
    publicKey = document.getElementById("public").value;
    privateKey = document.getElementById("private").value;

    let args = [];
        args[0] = publicKey;
        args[1] = privateKey;

    const buffer = JSON.stringify(args);

    getquery(buffer, function(res) {

        if (res.status == 200) { 

            let dossier = JSON.parse(res.responseText);
            let patient = decrypt(dossier, privateKey);
            document.getElementById("output").innerHTML = patient;
            }
    });
    }

function invoke(){

    publicKey = document.getElementById('public').value;
    privateKey = document.getElementById('private').value;
    dossierModif = document.getElementById('dossier').value;
    
    let Patient = {};

    let args = [publicKey];

    const buffer = JSON.stringify(args);
    
    getquery(buffer, function(res) {

        if( res.status ==  200) {
            let dossier = JSON.parse(res.responseText);
            Patient = decrypt (dossier, privateKey);
            Patient = JSON.parse(Patient);

            Patient.dossier = dossierModif;

            Patient = JSON.stringify(Patient);

            var encryptedData = encrypt(Patient, publicKey);

            let args = [];
                args[0] = publicKey;
                args[1] = encryptedData;

            const buffer = JSON.stringify(args);
            
            getinvoke(buffer, function(res) {
                    if(res.status == 200){
                        alert("success");
                }
            });
           
        }
    });
    }



function generateKeypair () {
    crypt = new JSEncrypt({default_key_size: 1024})
    privateKey = crypt.getPrivateKey()
          
    // Only return the public key, keep the private key hidden
    return crypt.getPublicKey()
    }
    
/** Encrypt the provided string with the destination public key */
function encrypt (content, publicKey) {
    let crypt = new JSEncrypt();
    crypt.setPublicKey(publicKey);
    return crypt.encrypt(content)
    }
      
/** Decrypt the provided string with the local private key */
function decrypt (content, privateKey) {
    let decrypt = new JSEncrypt();
    decrypt.setPrivateKey(privateKey);
    var uncrypt = decrypt.decrypt(content); 
    return uncrypt;
    }

/** Export keys */
function exportKeys (publicKey) {
    return  {
        publicKey: publicKey, 
        privateKey: privateKey
        }
    }
