import puppeteer from 'puppeteer';

// Launch the browser and open a new blank page
const browser = await puppeteer.launch();

const page = await browser.newPage();

// Navigate the page to a URL.
await page.goto('https://www.avito.ma/fr/boutiques/maroc/immobilier-%C3%A0_vendre');

// Set screen size.
await page.setViewport({width: 1080, height: 1024});

var informations=[];

const elements = await page.$$eval('.sc-dadxi2-0.fCSoyD', el => el.map(e => ({
    url:e.href,
    element:e.innerText,
    name: e.innerText.trim(),
    articles: e.innerText.match(/(\d+)\sArticles/) ? parseInt(e.innerText.match(/(\d+)\sArticles/)) : 0

  })));
  

  for (let element of elements) {


    // criteria i used to get only boutiques that have more than 200 articles 

    if (element.articles > 200) {

      let object={}


      await page.goto(element.url); 

      object.url=await page.url()
      object.articles=element.articles


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


  console.log("informations",informations)
  
  await browser.close();


//   console.log(elements);
  
