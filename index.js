import puppeteer from 'puppeteer';
import fs from 'fs';
import path from 'path';

var informations=[];
// Launch the browser and open a new blank page
const browser = await puppeteer.launch({ headless: false });

const page = await browser.newPage();


// Navigate the page to a URL.
await page.goto(`https://www.avito.ma/fr/boutiques/maroc/immobilier-%C3%A0_vendre?o=0`);

var totalAgencies = await page.$eval('.sc-1x0vz2r-0.mSbyI', el => el.textContent.trim())

totalAgencies=totalAgencies.match(/\((\d+)\)/);

const number = totalAgencies[1]; 
const parsedNumber = parseInt(number, 10);
/// Totale pages of immmobilier boutiques 
const totalPages=parseInt(parsedNumber/35)


// Set screen size.
await page.setViewport({width: 1080, height: 1024});

var currentPage=1


for (let i=1;i<=totalPages;i++){
      await page.goto(`https://www.avito.ma/fr/boutiques/maroc/immobilier-%C3%A0_vendre?o=${currentPage}`);
      const elements = await page.$$eval('.sc-dadxi2-0.fCSoyD', el => el.map(e => ({
        url:e.href,
        element:e.innerText,
        name: e.innerText.trim(),
        articles: e.innerText.match(/(\d+)\sArticles/) ? parseInt(e.innerText.match(/(\d+)\sArticles/)) : 0

      })));
      for (let element of elements) {
        await randomWait(300, 600);
        // criteria i used to get only boutiques that have more than 200 articles 
        if (element.articles > 1000) {

          let object={}
          await page.goto(element.url); 

          object.url=await page.url()
          object.articles=element.articles
          object.name=element.name
          console.log("element",element)
          await page.waitForSelector('.sc-1cr3r7-12.jZNltR');
          await page.waitForSelector('.sc-uoqswv-0.sc-uoqswv-1.sc-uoqswv-2.efaJYW.uyOfO.sc-1cr3r7-14.dSWPUN');
          await page.click('.sc-uoqswv-0.sc-uoqswv-1.sc-uoqswv-2.efaJYW.uyOfO.sc-1cr3r7-14.dSWPUN');

          const jsonContent = await page.$eval('script#__NEXT_DATA__', (el) => el.textContent);

            // Parse the JSON content
            const data = JSON.parse(jsonContent);

            // Extract the phone number
            const storeDetails = data.props.pageProps.apolloState.ROOT_QUERY
            const stores = Object.keys(storeDetails);


            stores.forEach(store => {
                const phoneNumber = storeDetails[store]?.phone?.number;
                if (phoneNumber) {
                    object.phone=phoneNumber
                }
              });


              if(object?.phone){
                informations.push(object)
              }
          
          await page.goBack();
        }
      }

      currentPage+=1
}

  
  await browser.close();


  const headers = ['name', 'articles', 'phone', 'url'];
  const rows = informations.map(info =>
    headers.map(field => `"${(info[field] || '').toString().replace(/"/g, '""')}"`).join(',')
  );

  const csvContent = [headers.join(','), ...rows].join('\n');

  // Write to file
  fs.writeFileSync(path.join('./boutiques.csv'), csvContent, 'utf8');

  console.log('✅ CSV file saved as boutiques.csv');

  function randomWait(min = 1000, max = 1500) {
    const ms = Math.floor(Math.random() * (max - min + 1)) + min;
    return new Promise(resolve => setTimeout(resolve, ms));
  }
  


//   console.log(elements);
  
