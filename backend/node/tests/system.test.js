import pkg from 'selenium-webdriver';
const { Builder, By, until } = pkg;
import fs from 'fs';

async function runSystemTests() {
    let driver = await new Builder().forBrowser('chrome').build();

    try {
        console.log('\n=== POKRETANJE ISPITIVANJA SUSTAVA (TravelMates) ===');

        console.log('Izvođenje Test 1: Ispunjavanje forme za registraciju...');
        await driver.get('http://localhost:5173/'); 
        
        await driver.wait(until.elementLocated(By.xpath("//input[@placeholder='Ime']")), 5000);
        
        await driver.findElement(By.xpath("//input[@placeholder='Ime']")).sendKeys('Ivan');
        await driver.findElement(By.xpath("//input[@placeholder='Prezime']")).sendKeys('Horvat');
        await driver.findElement(By.xpath("//input[@placeholder='Email']")).sendKeys('ivan.test@example.com');
        
        const signUpBtn = await driver.findElement(By.className('sign-up-button'));
        await signUpBtn.click();
        
        await driver.sleep(2000); 
        let img1 = await driver.takeScreenshot();
        fs.writeFileSync('1_test_registracija.png', img1, 'base64');
        console.log('✓ Test 1 gotov. Screenshot: 1_test_registracija.png');


        console.log('\nIzvođenje Test 2: Slanje prazne forme...');
        await driver.get('http://localhost:5173/');
        await driver.wait(until.elementLocated(By.className('sign-up-button')), 4000);
        await driver.findElement(By.className('sign-up-button')).click();
        
        try {
            await driver.wait(until.alertIsPresent(), 6000);
            let alert = await driver.switchTo().alert();
            console.log('✓ Uhvaćen alert: ' + await alert.getText());
            await alert.accept();
        } catch (e) {
            console.log('Nije pronađen alert.');
        }
        
        let img2 = await driver.takeScreenshot();
        fs.writeFileSync('2_test_validacija.png', img2, 'base64');


        console.log('\nIzvođenje Test 3: Provjera zabrane pristupa na /admin...');
        await driver.get('http://localhost:5173/admin');
        
        await driver.wait(until.elementLocated(By.tagName('h2')), 10000);

        console.log('Čekam stabilizaciju UI-ja...');
        await driver.sleep(3000);
        
        let pageText = await driver.findElement(By.tagName('body')).getText();
        
        if (pageText.includes('Pristup odbijen') || pageText.includes('Niste prijavljeni')) {
            console.log('✓ Sustav ispravno prepoznao neovlašten pristup.');
        } else {
            console.log('Upozorenje: Tekst zabrane nije pronađen, provjerite stanje prijavljenosti.');
        }

        let img3 = await driver.takeScreenshot();
        fs.writeFileSync('3_test_zabrana_admina.png', img3, 'base64');


        console.log('\nIzvođenje Test 4: Provjera dostupnosti mape...');
        await driver.get('http://localhost:5173/map');
        
        await driver.sleep(5000);
        let img4 = await driver.takeScreenshot();
        fs.writeFileSync('4_test_mapa.png', img4, 'base64');
        console.log('✓ Test 4 gotov.');


        console.log('\nIzvođenje Test 5: Provjera prikaza na mobilnim uređajima...');
        await driver.manage().window().setRect({ width: 375, height: 812 });
        await driver.get('http://localhost:5173/');
        await driver.sleep(2000);
        
        let img6 = await driver.takeScreenshot();
        fs.writeFileSync('5_test_mobile.png', img6, 'base64');
        console.log('✓ Screenshot mobilnog prikaza spremljen.');
        await driver.manage().window().setRect({ width: 1920, height: 1080 });
        

    } catch (err) {
        console.error('Greška tijekom izvođenja:', err);
    } finally {
        console.log('\n=== ISPITIVANJE ZAVRŠENO ===');
        await driver.quit();
    }
}

runSystemTests();