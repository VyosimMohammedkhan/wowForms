const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
puppeteer.use(StealthPlugin());

async function automation(url, fields) {
    const browser = await puppeteer.launch({ headless: false });
    const page = await browser.newPage();

    
    await page.goto(url, { timeout: 0 });

    async function findElementByField(page, field) {
        const xpath = `//input[contains(translate(@placeholder, 'ABCDEFGHIJKLMNOPQRSTUVWXYZ', 'abcdefghijklmnopqrstuvwxyz'), '${field}')] |  
            //label[contains(translate(text(), 'ABCDEFGHIJKLMNOPQRSTUVWXYZ', 'abcdefghijklmnopqrstuvwxyz'), '${field}')]/following-sibling::input | 
            //label[contains(translate(text(), 'ABCDEFGHIJKLMNOPQRSTUVWXYZ', 'abcdefghijklmnopqrstuvwxyz'), '${field}')]/following-sibling::div//input |
            //label[contains(translate(text(), 'ABCDEFGHIJKLMNOPQRSTUVWXYZ', 'abcdefghijklmnopqrstuvwxyz'), '${field}')]//input |
            //label[contains(translate(text(), 'ABCDEFGHIJKLMNOPQRSTUVWXYZ', 'abcdefghijklmnopqrstuvwxyz'), '${field}')]/input |
            //label/span[contains(translate(text(), 'ABCDEFGHIJKLMNOPQRSTUVWXYZ', 'abcdefghijklmnopqrstuvwxyz'), '${field}')]/following::div[1]/input |
            //span[contains(translate(text(), 'ABCDEFGHIJKLMNOPQRSTUVWXYZ', 'abcdefghijklmnopqrstuvwxyz'), '${field}')]/following::div[1]/div/input |
            //label[contains(translate(text(), 'ABCDEFGHIJKLMNOPQRSTUVWXYZ', 'abcdefghijklmnopqrstuvwxyz'), '${field}')]/following::div[1]/input`;

        if (xpath) {
            await page.waitForXPath(xpath);
            const [inputElement] = await page.$x(xpath);
            return inputElement;
        }
    }

        for (const field of fields) {
            try{
                const inputElement = await findElementByField(page, field.name);
                if (inputElement) {
                    await inputElement.type(field.value);
                    await page.screenshot({ path: `./${url.replace(/[^a-zA-Z0-9]/g, '_')}.jpg`, fullPage: true });
                }
            }catch{

            }
        }
    await browser.close();  
}

const urls = [
    "wowleads.com",
];

const fields = [
    { name: "name", value: "Vaibhav Kokare" },
    { name: "email", value: "vaibhavkokare@.com" },
    { name: "e-mail", value: "vaibhavkokare@.com"},
    { name: "phone", value:"1234567890"},
    { name: "telephone", value:"1234567890"},
    { name: "address", value:"kudal"},
    { name: "message", value:"something"},

];

for (const url of urls) {
    automation(url, fields);
}
