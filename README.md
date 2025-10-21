# TravelMate

TravelMate je web aplikacija namijenjena turistima i lokalnim posjetiteljima, koja omogućuje jednostavno otkrivanje, istraživanje i upoznavanje znamenitosti putem interaktivne karte. Korisnici mogu pregledavati atrakcije u svojoj blizini, čitati ili slušati njihove opise te spremati omiljena mjesta u favorite. Cilj projekta je olakšati planiranje obilazaka, poboljšati iskustvo razgledavanja i omogućiti intuitivno korištenje digitalnog turističkog vodiča, dok urednici održavaju sadržaj točnim i ažurnim.

# Opis projekta

## Napomena
Ovaj projekt je reultat timskog rada u sklopu projeknog zadatka kolegija [Programsko inženjerstvo](https://www.fer.unizg.hr/predmet/proinz) na Fakultetu elektrotehnike i računarstva Sveučilišta u Zagrebu. 

## Motivacija projekta
U današnje vrijeme turisti i lokalni posjetitelji često se suočavaju s izazovima pri pronalasku pouzdanih i ažurnih informacija o znamenitostima koje žele posjetiti. Unatoč velikoj količini dostupnih podataka na internetu, informacije su često raspršene, neažurne ili neprilagođene potrebama korisnika u pokretu. TravelMate je osmišljen kao rješenje koje objedinjuje sve relevantne podatke o atrakcijama na jednom mjestu, nudeći intuitivan prikaz putem interaktivne karte i mogućnost slušanja audio opisa. Cilj aplikacije je olakšati istraživanje destinacija, poboljšati turističko iskustvo i omogućiti svakom posjetitelju da jednostavno i ugodno otkriva kulturne i povijesne znamenitosti svog okruženja.

## Stečena znanja 
Radom na projektu TravelMate steći ćemo praktična znanja iz razvoja modernih web aplikacija koristeći React za izradu dinamičnog i responzivnog frontend sučelja te Node.js i Python za backend logiku i obradu podataka. Projekt omogućuje iskustvo u integraciji vanjskih servisa poput Google Maps API-ja i Text-to-Speech API-ja, kao i u implementaciji autentifikacije korisnika i upravljanju ulogama. Kroz razvoj aplikacije stječu se i vještine u dizajnu baza podataka te razumijevanje načela dobrog korisničkog iskustva i učinkovitog povezivanja frontend i backend dijela sustava.


# Funkcijski zahtjevi
* Aplikacija omogućuje korisnicima registraciju i prijavu putem e-maila i lozinke ili vanjske autentifikacije (OAuth, npr. Google login).

* Aplikacija prikazuje znamenitosti na korisniku bliskoj lokaciji pomoću Google Maps API-ja.

* Klikom na znamenitost korisniku se prikazuju detaljni opisi, slike i korisne informacije.

* Korisnici mogu spremiti znamenitosti u favorite radi bržeg pristupa.

* Aplikacija nudi mogućnost pretvaranja opisa znamenitosti u audio putem Text-to-Speech API-ja.

* Urednici mogu dodavati nove znamenitosti i uređivati postojeće podatke.

# Nefunkcijski zahtjevi

## Zahtjevi za održavanje
- Sustav treba biti modularno dizajniran radi lakšeg održavanja i nadogradnje.

## Zahtjevi za sigurnost
- Svi korisnički podaci moraju biti šifrirani i sigurno pohranjeni.
- Uredničke funkcije moraju biti dostupne samo korisnicima s ulogom urednika.

## Zahtjevi za skalabilnost
- Aplikacija mora podržati povećanje broja korisnika i znamenitosti bez značajnog pada performansi.
- Baza podataka mora biti skalabilna i podržavati brzo pretraživanje i dohvat podataka.

## Zahtjevi za performanse
- Vrijeme učitavanja karte i znamenitosti ne smije prelaziti 5 sekundi.

## Zahtjevi za korisničko sučelje
- Sučelje mora biti responzivno i prilagodljivo različitim veličinama ekrana.
- Navigacija kroz aplikaciju mora biti intuitivna.

## Zahtjevi za lokalizaciju 
- Aplikacija mora podržavati više jezika (hrvatski, engleski)


# Tehnologije

* Frontend: React Javascript
* Backend: Node js, Python
* Baza podataka: PostgreSQL
* Testiranje:
* Dokumentacija:

# Instalacija


# Članovi tima 
* Kristijan Orešić - voditelj tima <br>
* Vita Pavlović<br>
* Nola Bonačić Dorić<br>
* Ognjen Škarić<br>
* Nik Čolić<br>
* Franko Pavlić<br>

# Kontribucije
>Pravila ovise o organizaciji tima i su često izdvojena u CONTRIBUTING.md



# 📝 Kodeks ponašanja [![Contributor Covenant](https://img.shields.io/badge/Contributor%20Covenant-2.1-4baaaa.svg)](CODE_OF_CONDUCT.md)
Kao studenti sigurno ste upoznati s minimumom prihvatljivog ponašanja definiran u [KODEKS PONAŠANJA STUDENATA FAKULTETA ELEKTROTEHNIKE I RAČUNARSTVA SVEUČILIŠTA U ZAGREBU](https://www.fer.hr/_download/repository/Kodeks_ponasanja_studenata_FER-a_procisceni_tekst_2016%5B1%5D.pdf), te dodatnim naputcima za timski rad na predmetu [Programsko inženjerstvo](https://wwww.fer.hr).
Očekujemo da ćete poštovati [etički kodeks IEEE-a](https://www.ieee.org/about/corporate/governance/p7-8.html) koji ima važnu obrazovnu funkciju sa svrhom postavljanja najviših standarda integriteta, odgovornog ponašanja i etičkog ponašanja u profesionalnim aktivnosti. Time profesionalna zajednica programskih inženjera definira opća načela koja definiranju  moralni karakter, donošenje važnih poslovnih odluka i uspostavljanje jasnih moralnih očekivanja za sve pripadnike zajenice.

Kodeks ponašanja skup je provedivih pravila koja služe za jasnu komunikaciju očekivanja i zahtjeva za rad zajednice/tima. Njime se jasno definiraju obaveze, prava, neprihvatljiva ponašanja te  odgovarajuće posljedice (za razliku od etičkog kodeksa). U ovom repozitoriju dan je jedan od široko prihvačenih kodeks ponašanja za rad u zajednici otvorenog koda.
>### Poboljšajte funkcioniranje tima:
>* definirajte načina na koji će rad biti podijeljen među članovima grupe
>* dogovorite kako će grupa međusobno komunicirati.
>* ne gubite vrijeme na dogovore na koji će grupa rješavati sporove primjenite standarde!
>* implicitno podrazmijevamo da će svi članovi grupe slijediti kodeks ponašanja.
 
>###  Prijava problema
>Najgore što se može dogoditi je da netko šuti kad postoje problemi. Postoji nekoliko stvari koje možete učiniti kako biste najbolje riješili sukobe i probleme:
>* Obratite mi se izravno [e-pošta](mailto:vlado.sruk@fer.hr) i  učinit ćemo sve što je u našoj moći da u punom povjerenju saznamo koje korake trebamo poduzeti kako bismo riješili problem.
>* Razgovarajte s vašim asistentom jer ima najbolji uvid u dinamiku tima. Zajedno ćete saznati kako riješiti sukob i kako izbjeći daljnje utjecanje u vašem radu.
>* Ako se osjećate ugodno neposredno razgovarajte o problemu. Manje incidente trebalo bi rješavati izravno. Odvojite vrijeme i privatno razgovarajte s pogođenim članom tima te vjerujte u iskrenost.

# 📝 Licenca
Važeča (1)
[![CC BY-NC-SA 4.0][cc-by-nc-sa-shield]][cc-by-nc-sa]

Ovaj repozitorij sadrži otvoreni obrazovni sadržaji (eng. Open Educational Resources)  i licenciran je prema pravilima Creative Commons licencije koja omogućava da preuzmete djelo, podijelite ga s drugima uz 
uvjet da navođenja autora, ne upotrebljavate ga u komercijalne svrhe te dijelite pod istim uvjetima [Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International License HR][cc-by-nc-sa].
>
> ### Napomena:
>
> Svi paketi distribuiraju se pod vlastitim licencama.
> Svi upotrijebleni materijali  (slike, modeli, animacije, ...) distribuiraju se pod vlastitim licencama.

[![CC BY-NC-SA 4.0][cc-by-nc-sa-image]][cc-by-nc-sa]

[cc-by-nc-sa]: https://creativecommons.org/licenses/by-nc/4.0/deed.hr 
[cc-by-nc-sa-image]: https://licensebuttons.net/l/by-nc-sa/4.0/88x31.png
[cc-by-nc-sa-shield]: https://img.shields.io/badge/License-CC%20BY--NC--SA%204.0-lightgrey.svg

Orginal [![cc0-1.0][cc0-1.0-shield]][cc0-1.0]
>
>COPYING: All the content within this repository is dedicated to the public domain under the CC0 1.0 Universal (CC0 1.0) Public Domain Dedication.
>
[![CC0-1.0][cc0-1.0-image]][cc0-1.0]

[cc0-1.0]: https://creativecommons.org/licenses/by/1.0/deed.en
[cc0-1.0-image]: https://licensebuttons.net/l/by/1.0/88x31.png
[cc0-1.0-shield]: https://img.shields.io/badge/License-CC0--1.0-lightgrey.svg

### Reference na licenciranje repozitorija
