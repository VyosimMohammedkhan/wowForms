const { Cluster } = require('puppeteer-cluster');
const createCsvWriter = require('csv-writer').createObjectCsvWriter;
const fs = require('fs');
const xpaths = require("./xpaths.js")

const namelabelxpath = `
//*/label[contains(text(),'name')] | 
//*/label[contains(text(),'Name')] |
//*/label//*[contains(text(),'name')] |
 //*/label//*[contains(text(),'Name')]`
const autocompletenamexpath = `//*[@autocomplete='given-name']`
const namefieldxpath = `
//*/label[contains(text(),'Name')]/following-sibling::input |
//*/label[contains(text(),'Name')]/following-sibling::*//input |
//*/label[contains(text(),'Name')]/parent::*/following-sibling::*//input | 
//*/label[contains(text(),'Name')]/preceding-sibling::input | 
//*/label[contains(text(),'name')]/preceding-sibling::input | 
//*/label//*[contains(text(),'Name')]/parent::*/following-sibling::*/input | 
//*/label//*[contains(text(),'Name')]/parent::*/following-sibling::*//input |
//*/label//*[contains(text(),'name')]/parent::*/parent::*/following-sibling::*//input`

const nameplaceholderxpath = `
(//*/input[contains(@name,"name")]) | 
//*/input[contains(@name,"Name")] | 
//*/input[contains(@placeholder,"name")] |
//*/input[contains(@placeholder,"Name")]`

const lastnamelabelxpath = `
//*/label[contains(text(),'last')] | 
//*/label[contains(text(),'Last')] |
//*/label//*[contains(text(),'last')] |
//*/label//*[contains(text(),'Last')]`
const autocompletelastnamexpath = `//*[@autocomplete='family-name']`
const lastnamefieldxpath = `
//*/label[contains(text(),'Last')]/following-sibling::input | 
//*/label[contains(text(),'Last')]/following-sibling::*//input | 
//*/label[contains(text(),'Last')]/preceding-sibling::input | 
//*/label[contains(text(),'last')]/preceding-sibling::input | 
//*/label//*[contains(text(),'Last')]/parent::*/following-sibling::*/input | 
//*/label//*[contains(text(),'Last')]/parent::*/following-sibling::*//input |
//*/label//*[contains(text(),'last')]/parent::*/parent::*/following-sibling::*//input |
//*/label//*[contains(text(),'Last')]/parent::*/parent::*/following-sibling::*//input |
//*/label//*[contains(text(),'Last')]/parent::*/parent::*/parent::*/following-sibling::*`
const lastnameplaceholderxpath = `
//*/input[contains(@name,"last")] | 
//*/input[contains(@name,"Last")] | 
//*/input[contains(@placeholder,"last")] |
//*/input[contains(@placeholder,"Last")]`

const companynamelabelxpath = `
//*/label[contains(text(),'Business')] | 
//*/label[contains(text(),'Company')] | 
//*/label//*[contains(text(),'Business')] | 
//*/label//*[contains(text(),'Company')]`
const companynamefieldxpath = `
//*/label[contains(text(),'Business')]/following-sibling::input | 
//*/label[contains(text(),'Company')]/following-sibling::input | 
//*/label[contains(text(),'Business')]/following-sibling::*//input | 
//*/label[contains(text(),'Company')]/following-sibling::*//input | 
//*/label[contains(text(),'Business')]/preceding-sibling::input | 
//*/label[contains(text(),'Company')]/preceding-sibling::input | 
//*/label//*[contains(text(),'Business')]/parent::*/following-sibling::*/input | 
//*/label//*[contains(text(),'Company')]/parent::*/following-sibling::*//input |
//*/label//*[contains(text(),'Business')]/parent::*/parent::*/following-sibling::*//input |
//*/label//*[contains(text(),'Company')]/parent::*/parent::*/following-sibling::*//input`
const companynameplaceholderxpath = `
//*/input[contains(@name,"Business")] | 
//*/input[contains(@name,"Company")] | 
//*/input[contains(@placeholder,"Business")] |
//*/input[contains(@placeholder,"Company")] |
//*/input[contains(@name,"business")] | 
//*/input[contains(@name,"company")] | 
//*/input[contains(@placeholder,"business")] |
//*/input[contains(@placeholder,"company")]`;

const subjectlabelxpath = `
//*/label[contains(text(),'Subject')] | 
//*/label[contains(text(),'subject')] | 
//*/label//*[contains(text(),'Subject')] | 
//*/label//*[contains(text(),'subject')]`
const subjectfieldxpath = `
//*/label[contains(text(),'Subject')]/following-sibling::input | 
//*/label[contains(text(),'subject')]/following-sibling::input | 
//*/label[contains(text(),'Subject')]/following-sibling::*//input | 
//*/label[contains(text(),'subject')]/following-sibling::*//input | 
//*/label[contains(text(),'Subject')]/preceding-sibling::input | 
//*/label[contains(text(),'subject')]/preceding-sibling::input | 
//*/label//*[contains(text(),'Subject')]/parent::*/following-sibling::*/input | 
//*/label//*[contains(text(),'subject')]/parent::*/following-sibling::*//input |
//*/label//*[contains(text(),'Subject')]/parent::*/parent::*/following-sibling::*//input |
//*/label//*[contains(text(),'subject')]/parent::*/parent::*/following-sibling::*//input`
const subjectplaceholderxpath = `
//*/input[contains(@name,"Subject")] | 
//*/input[contains(@name,"subject")] | 
//*/input[contains(@placeholder,"Subject")] |
//*/input[contains(@placeholder,"subject")]`;

const emaillabelxpath = `
//*/label[contains(text(),'email')] | 
//*/label[contains(text(),'Email')] | 
//*/label//*[contains(text(),'email')] | 
//*/label//*[contains(text(),'Email')]`
const emailfieldtype = `//*/input[@type='email']`
const emailfieldxpath = `
//*/label[contains(text(),'email')]/following-sibling::input | 
//*/label[contains(text(),'Email')]/following-sibling::input | 
//*/label[contains(text(),'email')]/following-sibling::*//input | 
//*/label[contains(text(),'Email')]/following-sibling::*//input | 
//*/label[contains(text(),'email')]/preceding-sibling::input | 
//*/label[contains(text(),'Email')]/preceding-sibling::input | 
//*/label//*[contains(text(),'email')]/parent::*/following-sibling::*/input | 
//*/label//*[contains(text(),'Email')]/parent::*/following-sibling::*//input |
//*/label//*[contains(text(),'email')]/parent::*/parent::*/following-sibling::*//input |
//*/label//*[contains(text(),'Email')]/parent::*/parent::*/following-sibling::*//input`
const emailplaceholderxpath = `
//*/form//input[contains(@name,"email")] | 
//*/form//input[contains(@name,"Email")] | 
//*/form//input[contains(@placeholder,"email")] |
//*/form//input[contains(@placeholder,"Email")]`;


const phonelabelxpath = `
//*/label[contains(text(),'Phone')] | 
//*/label[contains(text(),'phone')] | 
//*/label//*[contains(text(),'Phone')] | 
//*/label//*[contains(text(),'phone')] |
//*/label[contains(@for,'phone')]
`
const phonefieldtype = `//*/input[@type='tel']`
const phonefieldxpath = `
//*/label[contains(text(),'phone')]/following-sibling::input | 
//*/label[contains(text(),'Phone')]/following-sibling::input | 
//*/label[contains(text(),'phone')]/following-sibling::*//input | 
//*/label[contains(text(),'Phone')]/following-sibling::*//input | 
//*/label[contains(text(),'phone')]/preceding-sibling::input | 
//*/label[contains(text(),'Phone')]/preceding-sibling::input | 
//*/label[contains(@for,'phone')]/following-sibling::input |
//*/label//*[contains(text(),'phone')]/parent::*/following-sibling::*/input | 
//*/label//*[contains(text(),'Phone')]/parent::*/following-sibling::*//input |
//*/label//*[contains(text(),'phone')]/parent::*/parent::*/following-sibling::*//input |
//*/label//*[contains(text(),'Phone')]/parent::*/parent::*/following-sibling::*//input`
const phoneplaceholderxpath = `
//*/input[contains(@name,"phone")] | 
//*/input[contains(@name,"Phone")] | 
//*/input[contains(@placeholder,"phone")] |
//*/input[contains(@placeholder,"Phone")] |
//*[contains(@placeholder, 'Tel')]`

const addresslabelxpath = `
//*/label[contains(translate(text(), "ADRES", "adres"),'Address') and not(contains(translate(text(), "EMAIL", "email"),"email"))] |  
//*/label//*[contains(translate(text(), "ADRES", "adres"),'Address') and not(contains(translate(text(), "EMAIL", "email"),"email"))]
`
const addressfieldxpath = `
//*/label[contains(translate(text(), 'ADRES', 'adres'),'address') and not(contains(translate(text(), "EMAIL", "email"),"email"))]/following-sibling::input |
//*/label[contains(translate(text(), 'ADRES', 'adres'),'address') and not(contains(translate(text(), "EMAIL", "email"),"email"))]/following-sibling::*//input |
//*/label[contains(translate(text(), 'ADRES', 'adres'),'address') and not(contains(translate(text(), "EMAIL", "email"),"email"))]/preceding-sibling::input |
//*/label//*[contains(translate(text(), 'ADRES', 'adres'),'address') and not(contains(translate(text(), "EMAIL", "email"),"email"))]/parent::*/following-sibling::*/input | 
//*/label//*[contains(translate(text(), 'ADRES', 'adres'),'Address') and not(contains(translate(text(), "EMAIL", "email"),"email"))]/parent::*/following-sibling::*//input |
//*/label//*[contains(translate(text(), 'ADRES', 'adres'),'address') and not(contains(translate(text(), "EMAIL", "email"),"email"))]/parent::*/parent::*/following-sibling::*//input`
const addressplaceholderxpath = `
//*/input[contains(@name,"address") and not(contains(@name,"Email"))] |
//*/input[contains(@name,"Address") and not(contains(@name,"Email"))] |
//*/input[contains(@placeholder,"address") and not(contains(translate(@placeholder, "EMAIL", "email"),"email"))] |
//*/input[contains(@placeholder,"Address") and not(contains(translate(@placeholder, "EMAIL", "email"),"email"))]`;

const citylabelxpath = `
//*/label[contains(text(),'City')] | 
//*/label[contains(text(),'city')] | 
//*/label//*[contains(text(),'City')] | 
//*/label//*[contains(text(),'city')]`
const cityfieldxpath = `
//*/label[contains(text(),'city')]/following-sibling::input | 
//*/label[contains(text(),'City')]/following-sibling::input | 
//*/label[contains(text(),'city')]/following-sibling::*//input | 
//*/label[contains(text(),'City')]/following-sibling::*//input | 
//*/label[contains(text(),'city')]/preceding-sibling::input | 
//*/label[contains(text(),'City')]/preceding-sibling::input | 
//*/label//*[contains(text(),'city')]/parent::*/following-sibling::*/input | 
//*/label//*[contains(text(),'City')]/parent::*/following-sibling::*//input |
//*/label//*[contains(text(),'city')]/parent::*/parent::*/following-sibling::*//input |
//*/label//*[contains(text(),'City')]/parent::*/parent::*/following-sibling::*//input`
const cityplaceholderxpath = `
//*/input[contains(@name,"city")] | 
//*/input[contains(@name,"City")] | 
//*/input[contains(@placeholder,"city")] |
//*/input[contains(@placeholder,"City")]`;

const statelabelxpath = `
//*/label[contains(text(),'State')] | 
//*/label[contains(text(),'state')] | 
//*/label//*[contains(text(),'State')] | 
//*/label//*[contains(text(),'state')]`

const statefieldxpath = `
//*/label[contains(text(),'state')]/following-sibling::input | 
//*/label[contains(text(),'State')]/following-sibling::input | 
//*/label[contains(text(),'state')]/following-sibling::*//input | 
//*/label[contains(text(),'State')]/following-sibling::*//input | 
//*/label[contains(text(),'state')]/preceding-sibling::input | 
//*/label[contains(text(),'State')]/preceding-sibling::input | 
//*/label//*[contains(text(),'state')]/parent::*/following-sibling::*/input | 
//*/label//*[contains(text(),'State')]/parent::*/following-sibling::*//input |
//*/label//*[contains(text(),'state')]/parent::*/parent::*/following-sibling::*//input |
//*/label//*[contains(text(),'State')]/parent::*/parent::*/following-sibling::*//input`
const stateplaceholderxpath = `
//*/input[contains(translate(@name, "STAE", "stae"),"state") and not(@type="hidden")] |
//*/input[contains(translate(@placeholder, "STAE", "stae"),"state")]`

const messageTextareaxpath = `//*/textarea`

const dropdownxpath = `//*/select`

const submitbuttonxpath = `
//*/button[@type='submit'] |
//*/form//button[contains(text(),'Contact')] |
//*/input[translate(@type, 'SUBMIT', 'submit')='submit'] |
//*/input[translate(@value, 'SUBMIT', 'submit')='submit'] |
//*/button[contains(translate(text(), 'SEND', 'send'), 'send')] |
//*/button[contains(translate(text(), 'SUBMIT', 'submit'), 'submit')] |
//*/button//*[contains(translate(text(), 'SEND', 'send'), 'send')]/ancestor::button |
//*/button//*[contains(translate(text(), 'SUBMIT', 'submit'), 'submit')]/ancestor::button
`

const capchaxpath = `//*/form//img[@alt='captcha'] | 
//*/form//iframe[@title='reCAPTCHA'] | 
//form//*[contains(text(),'reCAPTCHA')]
`
const urls = [
    // "https://www.hugedomains.com/contact.cfm",   //p
    // "https://twitter.com/Contom/contact.html",   //p
    // "https://www.hireheronow.com/contact",   //p
    // "https://www.cwood.org/cwood/contact_cwood/",      //p
    // "http://www.itcscorp.net/contactus.html",    //p
    // "https://www.hetlinger.org/contact-us",     //p
    // "https://commoditystaffing.com/#contact",   //p
    // "https://www.hrstaff.net/contact/",     //p
    // "https://www.staffingbyse7en.com/",     //p
    "https://ilanascaremiami.com/contact-us",    //p
    // "https://www.wastaffingllc.com/contact-us",  //p
    // "https://www.deanstaffingandrecruiting.com/contact",       //captcha
    // "https://help.accessncworks.com/hc/en-us/articles/360019765091-Contact-Information", //p
    // "https://www.careertransitionsllc.com/placement-services/", //p
    // "https://www.laborquicknc.com/?utm_source=rsd&utm_medium=gmb#Contact-Us", //p
    // "http://formularesources.com/#contact",         //p
    // "https://www.thepattytiptoncompany.com/contact-us", //p
    // "https://www.escstaff.com/contact.html",    //p
    // "https://www.asapstaffing24-7.com/contact-us",  //p
    // "https://hirequest.com/contact-us/",    //P
    // "https://www.wellingtonexecutivesearch.com/contact-us",  //f email is textarea
    // "https://www.bcsmis.com/contact-us/",   //p
    // "https://workforceatlas.org/contact",   //p
    // "https://www.fgp.com/contact-us/",   //p
    // "https://connexissearch.com/contact/",  //f form takes too long to load
    // "https://www.isg-staffing.com/contact", //captcha
    // "https://www.gemresourcing.com/contact-us/",    //f because of cookie popup
    // "https://www.abicsl.com/contact-us",    //p
    // "https://assuredemploymentstaffing.com/contact", //p
    // "https://www.expresspros.com/CouncilBluffsIA/Contact-Us/Default.aspx",  //p
    // "https://www.springbornstaffing.com/temporary-staffing-companies/",     //p
    // "https://www.taylortechnical.com/contact/", //p
    // "https://copelandstaffingandrecruiting.com/contact-us", //p
    // "https://aggressivehiring.com/contact-us/",     //p
    // "https://www.msfingerlakes.com/contact-us-2/",       //p
    // "https://www.can-amconsultants.com/contact.php", //p
    // "https://thecandoragency.net/contact-us",       //p
    // "https://lehmancr.com/contact/",        //f email not filled in the right field
    // "https://www.davidjosephinc.com/contact/",  //p
    // "https://www.nexgoal.com/recruiting-services-contact/",     //f failing due to conflict in xpath priority
    // "https://ehospitalhire.com/contact-us/",    //p
    // "https://bridgeworkpartners.com/contact-us/",   //p
    // "https://www.faharistaffing.com/contact-us/",   //p
    // "https://www.repucare.com/contact-5",   //p
    // "https://onsitesvs.com/contact-us",     //p
    // "https://getbsquared.com/contact/",     //p
    // "https://ajc.lincoln.ne.gov/contact-us/",   //p
    // "https://www.mystaffinc.com/contact/",     //p      
    // "https://theconnectagency.co/contact",      //f form is not present but it's detected in html
    // "https://eliteresources.net/employers",  //f form is detected but not filled
    // "http://www.premierestaffing.net/Premiere2014/contact.html",        //p
    // "https://www.lighthousehrs.net/contact/contact-us",     //captcha
    // "http://www.kaiserwhitney.com/contact/",        //f message typed in phone field. not making sense
    // "https://www.besttemps.com/contact",        //p
    // "https://www.aheadhr.com/contact-us/",       //f dropdown required and last name is not filling
    // "https://huntsville.snelling.com/contact/",      //f  zip code is required and should match the given US state
    // "https://outsource.net/contact/",   //f no form present but its detected in html
    // "https://www.coadvantage.com/contact-us/",      //p
    // "https://stafftodayinc.com/contact-us.html",     //p
    // "https://staffingspecifix.com/contact-us/",     //captcha
    // "https://www.sebenzasource.com/sebenza/contact",        //p
    // "https://www.promptprioritystaffing.com/contact",       //f other mandatory fields present
    // "https://www.arlingtonva.us/Home/Contact-Arlington",        //p
    // "https://www.pettitstaffing.com/contact",        //p
    // "http://ptalents.com/#formulario_contacto",     //f name not filled
    // "https://www.ahelpinghandstaffing.com/contact",     //captcha
    // "https://www.alpstaffing.com/contact",      //p
    // "https://hr.infoprosol.com/contactus.html",     //f form not filled
    // "https://www.expresspros.com/LongviewWA/Contact/Longview/",     //f radio button mandatory
    // "https://energeostaffing.com/contact-us/",      //captcha
    // "https://www.staffingplusjobs.com/contact/",     //p
    // "https://www.consilio.com/contact/",    //p
    // "https://www.reliantstaffing.com/contact/",  //p
    // "https://www.aramark.com/about-us/enterprise-solutions/dietetic-internship/-us",        //p
    // "https://saleminc.com/contact-us/",     //p
    // "https://talentteam.com/contact-us/",    //captcha
    // "https://x3tradesmen.com/contact-us/",      //captcha
    // "https://www.greencountrystaffing.com/contact/",        //p
    // "https://www.positiveresultsstaffing.com/",     //p
    // "http://allstaffusa.com/contact.php",    //p
    // "https://thejobshoppe.com/contact-us/",     //p
    // "https://www.hamilton-ryker.com/contact/",       //p
    // "https://www.solutionsstaffing.com/contact/",       //p
    // "https://caracollective.org/contact/",       //f form not filled
    // "https://promaxpersonnel.com/contact-us/",       //p
    // "https://www.seekcareers.com/contact-us/",       //captcha
    // "https://arrowworkforce.com/contact-us/",        //captcha
    // "http://www.suntechpros.com/",      //captcha
    // "https://www.ebintl.com/ContactUS",      //f form not filled
    // "https://digipulsetech.com/contact-us/",     //f address is textarea
    // "https://xyant.com/contact-us/",     //f name not filled
    // "https://www.luxoft.com/contact-form",       //captcha
    // "https://www.blackknightinc.com/contact-us/?",       //captcha
    // "http://www.sibitalent.com/contact.php",     //f form not filled
    // "https://sparibis.com/s/contact",        //p
    // "https://infinitysolutions.ca/contact-us/",      //f name not filled
    // "https://creospan.com/contact-us/",      //f name not filled
    // "http://www.vertexsolutionsinc.com/contact.shtml",       //p 
    // "http://www.highbridgeusa.com/contactus.html",       //
    // "http://www.pintegrallc.com/?page_id=17",        //p
    // "http://biz3tech.com/contact/",
    // "https://www.smartsourcetec.com/contact_us",
    // "https://itscient.com/contact-us",
    // "https://www.neweratech.com/us/contact-us/",
    // "https://www.grantpeters.com/contact-grant-peters-associates.html",
    // "https://www.useready.com/contact-us/",
    // "https://www.marathonus.com/contact/",
    // "https://talentiqo.com/contact-us/",
    // "http://www.corevance.com/contact.html",
    // "https://tumblekidswatertown.com/contact/",
    // "https://www.affinity.co/contact-us",
    // "https://www.helloflare.com/copy-of-disability-contact-form",
    // "https://soccershopusa.com/contact/",
    // "https://www.globalcu.org/financial-planning/contact/",
    // "https://www.indstate.edu/contact",
    // "https://www.simplot.com/contact_us",
    // "https://www.sohohouse.com/en-us/contact",
    // "https://familiesusa.org/about/#contact-us",
    // "https://lcsnw.org/about/contact/",
    // "https://www.alto.us/contact/",
    // "https://www.tpicap.com/",
    // "https://www.aaryah.com/pages/contact-us",
    // "https://www.raysearchlabs.com/about/contact/",
    // "https://www.chromaus.com/contact.html",
    // "http://www.anrcomfortcare.com/contact-us.html",
    // "https://www.abm.com/contact/",
    // "https://www.pegasusresidential.com/contact-us",
    // "https://www.jorgeng.com/contact",
    // "https://morganwhite.com/contact",
    // "https://mrscleanpgh.com/contact/",
    // "https://www.simonswerk.com/service/contact",
    // "https://stonemountaintoyota.com/contact-us",
    // "https://www.cheyenneregional.org/contact/",
    // "https://www.paivafinancial.com/contact",
    // "https://sciodpm.com/contact/",
    // "https://mstaxprep.com/contact-us/",
    // "https://www.redpointglobal.com/company/contact/",
    // "https://www.frankhajekandassociates.com/contact.php",
    // "http://www.trif.com/contact-us/",
    // "https://www.m-csi.com/contact-us/",
    // "http://kkdesignonline.com/#contact",
    // "http://www.ncomm.com/ncomm/contact-us",
    // "https://telebright.com/#contact",
    // "https://www.bdkinc.com/contact",
    // "https://healaccounting.com/contact-us/",
    // "https://cyberconnection.us/contact-us/",
    // "https://tannerwest.com/contact-us/",
    // "http://techsolutionsmaine.com/#contact-1",
    // "https://bettystaxservices.com/contact",
    // "https://www.bonaventuredesign.com/contact-us/",
    // "https://ginnyweaver.com/contact/",
    // "https://artc.systems/contact-us/",
    // "https://propylon.com/contact/",
    // "https://www.platecompany.com/index.php/contact",
    // "http://nybbleteksolutions.com/contact-us/",
    // "https://www.morrow-accounting.com/contact",
    // "https://fosteraccountingin.com/contact",
    // "https://systemdomaininc.com/contact.php",
    // "https://www.stablepug.com/#contact",
    // "https://www.mstech-eyes.com/contact-us",
    // "https://newcastleassoc.com/contact-chicago-information-technology-staffing/",
    // "https://amsacct.com/contacts",
    // "http://www.dennisrwencel.com/ContactUs.html",
    // "https://infobankmediaseo.com/contact/",
    // "https://www.cashregisterguys.com/contact.html",
    // "https://www.julieawhelancpallc.com/",
    // "http://www.rangeus.com/contact/",
    // "https://helpdesk.bitrix24.com/ticket.php?ID=0",
    // "https://fedeleandassociates.com/#contact",
    // "https://emergingbusinessservices.com/contact/",
    // "https://www.sagebooksinc.com/contact",
    // "https://knowink.com/contact-us/",
    // "https://www.innovativetimingsystems.com/contact-us",
    // "http://corptechs.com/contact-us.aspx",
    // "http://hmscpa.com/contact-us/",
    // "https://mackmediallc.com/#contact-us",
    // "https://triafed.com/contact-us/",
    // "https://www.hugedomains.com/contact.cfm",
    // "https://designbratzleadville.com/contact",
    // "https://quantale.io/#contact",                 //pass
    // "http://coswebsiteservices.com/contact.html",       //pass
    // "https://www.sms360.com/",      //company name is textareea
    // "https://www.rydzikcpa.com/contact",
    // "https://www.biginternet.co.uk/contact/", // np form
    // "http://alpineaccountingservices.com/contact/",     //contains question wihtout captcha
    // "https://www.mjpenistoncpa.com/contact-us",         //pass
    // "https://www.feiscocpa.com/contact",            //no form
    // "http://www.moviltrack.com/contacto.html"    //non english site
];




function delay(time) {
    return new Promise(function (resolve) {
        setTimeout(resolve, time)
    })
}

async function autoforms(urls) {
    const cluster = await Cluster.launch({
        concurrency: Cluster.CONCURRENCY_CONTEXT,
        maxConcurrency: 5,
        timeout: 1000 * 1000,
        puppeteerOptions: {
            headless: false,
            defaultViewport: null,
            args: ['--no-sandbox', '--disable-setuid-sandbox', '--fast-start', '--disable-extensions', '--start-maximized']

        }
    });

    await cluster.task(async ({ page, data: url }) => {

        let screenshotname = new URL(url).hostname
        console.log(screenshotname)
        try {

            await page.setUserAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/85.0.4182.0 Safari/537.36')
            page.setDefaultTimeout(0)
            let result = { url: url };
            await page.goto(url, { waitUntil: 'domcontentloaded' });

            await page.waitForXPath('//*/body')
            await delay(10000)
            result.formfound = await isformpresent(page)
            let formframe = await findFormframe(page, url)
            let submitbutton;
            if (result.formfound) {
                await fillFormDetails(page, page, result, screenshotname)
                submitbutton = await findSubmitButtonAndCapcha(page, result)
            } else if (formframe) {
                await fillInframeform(page, formframe, result, screenshotname)
                submitbutton = await findSubmitButtonAndCapcha(formframe, result)
            } else {
                result.submitButtonPresent = 'NA'
                result.captchaPresent = 'NA'
                result.formfilled = 'NA'
            }

            //----------------------submission----------------------------
            // await confirmSubmission(page, submitbutton[1])
            //============================================================


            await addresulttocsv([result])
            console.log(result)
            await delay(1000 * 100)
        } catch (err) {
            console.log(err.message)
        }

    });


    for (let url of urls) {
        url = addhttps(url)
        cluster.queue(url);
    }


    await cluster.idle();
    await cluster.close();

}

function addhttps(url) {
    if (!url.startsWith("http://") && !url.startsWith("https://")) {
        return "https://" + url;
    }
    return url = url.trim();
}

async function addresulttocsv(data) {
    const csvWriter = createCsvWriter({
        path: 'Results.csv',
        header: [
            { id: 'url', title: 'url' },
            { id: 'formfound', title: 'formfound' },
            { id: 'submitButtonPresent', title: 'submitButtonPresent' },
            { id: 'captchaPresent', title: 'captchaPresent' },
            { id: 'formfilled', title: 'formfilled' }
        ],
        append: true
    });

    const fileExists = fs.existsSync('Results.csv');
    if (!fileExists) {
        csvWriter.writeRecords([{
            url: 'URL',
            formfound: 'formFound',
            submitButtonPresent: 'submitButtonPresent',
            captchaPresent: 'captchaPresent',
            formfilled: 'formFilled'
        }]);
    }

    csvWriter
        .writeRecords(data)
        .then(() => {

        })
        .catch(err => {
            console.error('Error appending data to CSV file:', err.message);
        });
}

async function isformpresent(page) {
    let textarea = await page.$x(`//*/textarea`)
    if (textarea.length > 0) {
        return true
    }
    return false
}

async function fillInframeform(page, formframe, result, url) {
    result.formfound = await isformpresent(formframe)
    if (result.formfound) {
        await fillFormDetails(page, formframe, result, url)
    } else {
        // console.log("could not detect form on ", url)
    }
}

async function findFormframe(page, url) {
    let frames = await page.frames();
    let formframe;
    for (const frame of frames) {
        let frameTitle = await frame.title() + " "
        let frameUrl = await frame.url()
        if (frameUrl != url && frameUrl.includes('form') && !frameTitle.includes('Sign in with Google Button'))
            formframe = frame
    }
    return formframe
}

async function findSubmitButtonAndCapcha(page, result) {

    let submitbutton = await page.$x(submitbuttonxpath)
    let captcha = await page.$x(capchaxpath)

    result.submitButtonPresent = submitbutton.length > 0 ? true : false
    result.captchaPresent = captcha.length > 0 ? true : false

    return submitbutton
}


async function fillFormDetails(page, formframe, result, screenshotname) {
    await fillName(formframe, result)
    await delay(1000)
    await fillLastName(formframe, result)
    await delay(1000)
    await fillcompanyname(formframe, result)
    await delay(1000)
    await fillemail(formframe, result)
    await delay(1000)
    await fillphone(formframe, result)
    await delay(1000)
    await fillsubject(formframe, result)
    await delay(1000)
    await fillmessage(formframe, result)
    await delay(1000)
    await handledropdown(formframe, result)
    await delay(1000)
    await filladdress(formframe, result)
    await delay(1000)
    await fillcity(formframe, result)
    await delay(1000)
    await fillstate(formframe, result)

    result.formfilled = true
    await page.screenshot({
        path: `images/${screenshotname}.jpg`,
        fullPage: true
    });
}

async function fillName(page, result) {
    let namelabel = await page.$x(xpaths.namelabelxpath)
    let nameField = await page.$x(xpaths.namefieldxpath);
    let nameplaceholder = await page.$x(xpaths.nameplaceholderxpath)
    let autocompletename = await page.$x(xpaths.autocompletenamexpath)


    let visibleElements = await getVisibleElements([...autocompletename, ...nameField, ...nameplaceholder])


    try {
        if (visibleElements.length > 0) {
            await fieldclear(visibleElements[0])
            await visibleElements[0].type("VyosimFirst")
        } else {
            // console.log("no first name elements found for ", result.url)
        }
    } catch (err) {
        console.log(err.message)
    }

}

async function fillLastName(page, result) {
    let lastnamelabel = await page.$x(lastnamelabelxpath)
    let lastnameField = await page.$x(lastnamefieldxpath);
    let lastnameplaceholder = await page.$x(lastnameplaceholderxpath)
    let autocompletelastname = await page.$x(autocompletelastnamexpath)

    let visibleElements = await getVisibleElements([...autocompletelastname, ...lastnameplaceholder, ...lastnameField])

    try {
        if (visibleElements.length > 0) {
            await fieldclear(visibleElements[0])
            await visibleElements[0].type("VyosimLast")
        } else {
            // console.log("no Last name elements found for ", result.url)
        }
    } catch (err) {
        console.log(err.message)
    }

}

async function fillemail(page, result) {
    let emaillabel = await page.$x(emaillabelxpath)
    let emailfieldbytype = await page.$x(emailfieldtype)
    let emailfield = await page.$x(emailfieldxpath)
    let emailplaceholder = await page.$x(emailplaceholderxpath)

    let visibleElements = await getVisibleElements([...emailfieldbytype, ...emailfield, ...emailplaceholder])

    try {
        if (visibleElements.length > 0) {
            await fieldclear(visibleElements[0])
            await visibleElements[0].type("vyosim@gmail.com")
        } else {
            // console.log("no email elements found for ", result.url)
        }
    } catch (err) {
        console.log(err.message)
    }

}


async function fillphone(page, result) {
    let phonelabel = await page.$x(phonelabelxpath)
    let phonefieldbytype = await page.$x(phonefieldtype)
    let phonefield = await page.$x(phonefieldxpath)
    let phoneplaceholder = await page.$x(phoneplaceholderxpath)


    let visibleElements = await getVisibleElements([...phonefieldbytype, ...phoneplaceholder, ...phonefield])

    try {
        if (visibleElements.length > 0) {
            await fieldclear(visibleElements[0])
            await visibleElements[0].type("1234567890")
        } else {
            // console.log("no phone elements found for ", result.url)
        }
    } catch (err) {
        console.log(err.message)
    }

}


async function filladdress(page, result) {
    let addresslabel = await page.$x(addresslabelxpath)
    let addressfield = await page.$x(addressfieldxpath)
    let addressplaceholder = await page.$x(addressplaceholderxpath)

    console.log(addressplaceholder.length)
    console.log(addressfield.length)
    let visibleElements = await getVisibleElements([...addressplaceholder, ...addressfield])

    try {
        if (visibleElements.length > 0) {
            await fieldclear(visibleElements[0])
            await visibleElements[0].type("SRM College, Kudal")
        } else {
            // console.log("no address elements found for ", result.url)
        }
    } catch (err) {
        console.log(err.message)
    }

}

async function fillcity(page, result) {
    let citylabel = await page.$x(citylabelxpath)
    let cityfield = await page.$x(cityfieldxpath)
    let cityplaceholder = await page.$x(cityplaceholderxpath)

    let visibleElements = await getVisibleElements([...cityplaceholder, ...cityfield])

    try {
        if (visibleElements.length > 0) {
            await fieldclear(visibleElements[0])
            await visibleElements[0].type("Kudal")
        } else {
            // console.log("no city elements found for ", result.url)
        }
    } catch (err) {
        console.log(err.message)
    }


}

async function fillstate(page, result) {
    let statelabel = await page.$x(statelabelxpath)
    let statefield = await page.$x(statefieldxpath)
    let stateplaceholder = await page.$x(stateplaceholderxpath)

    let visibleElements = await getVisibleElements([...stateplaceholder, ...statefield])

    try {
        if (visibleElements.length > 0) {
            await fieldclear(visibleElements[0])
            await visibleElements[0].type("Maharashtra")
        } else {
            // console.log("no state elements found for ", result.url)
        }
    } catch (err) {
        console.log(err.message)
    }

}


async function fillcompanyname(page, result) {
    let companynamelabel = await page.$x(companynamelabelxpath)
    let companynamefield = await page.$x(companynamefieldxpath)
    let companynameplaceholder = await page.$x(companynameplaceholderxpath)

    let visibleElements = await getVisibleElements([...companynameplaceholder, ...companynamefield])

    try {
        if (visibleElements.length > 0) {
            await fieldclear(visibleElements[0])
            await visibleElements[0].type("Vyosim")
        } else {
            // console.log("no companyname elements found for ", result.url)
        }
    } catch (err) {
        console.log(err.message)
    }

}

async function fillsubject(page, result) {
    let subjectlabel = await page.$x(subjectlabelxpath)
    let subjectfield = await page.$x(subjectfieldxpath)
    let subjectplaceholder = await page.$x(subjectplaceholderxpath)

    let visibleElements = await getVisibleElements([...subjectplaceholder, ...subjectfield])
    try {
        if (visibleElements.length > 0) {
            await fieldclear(visibleElements[0])
            await visibleElements[0].type("TestSubject")
        } else {
            // console.log("no subject elements found for ", result.url)
        }
    } catch (err) {
        console.log(err.message)
    }

}

async function fillmessage(page, result) {
    let messageTextarea = await page.$x(messageTextareaxpath)

    let visibleElements = await getVisibleElements(messageTextarea)
    console.log(visibleElements.length)
    try {
        if (visibleElements.length > 0) {
            await fieldclear(visibleElements[0])
            await visibleElements[0].type("This is a Test Message")
        } else {
            // console.log("no message elements found for ", result.url)
        }
    } catch (err) {
        console.log(err.message)
    }

}

async function handledropdown(page, result) {

    let dropdown = await page.$x(dropdownxpath)
    let optionTochoose = await page.$x(`//*/option[contains(text(),'Other')] | //*/option[contains(text(),'else')]`)

    try {
        if (dropdown.length > 0 && optionTochoose.length > 0) {
            let optionValue = await (await optionTochoose[0].getProperty('value')).jsonValue()
            dropdown[0].select(optionValue)
        } else {
        }
    } catch (err) {
        console.log(err.message)
    }
}



async function getVisibleElements(Elements) {
    let visibleElements = []

    for (let element of Elements) {
        let elementVisible = await isElementVisible(element)
        if (elementVisible) {
            visibleElements.push(element)
        }
    }

    return visibleElements
}

async function isElementVisible(element) {

    const visibilityStatus = await element.evaluate(element => {
        const style = getComputedStyle(element);
        return {
            visibility: style.visibility
        };
    });

    const typeAttribute = await element.evaluate(element => element.getAttribute('type'));

    if (visibilityStatus.visibility == 'hidden' || (typeAttribute && typeAttribute.toLowerCase() === 'hidden')) {
        return false
    } else {
        return true
    }

}


async function confirmSubmission(page, submitbutton) {

    await page.setRequestInterception(true);

    page.on('request', (request) => {
        request.continue(); // Allow all requests to continue
    });

    let formSubmitted = false;

    // Listen for the relevant network response
    page.on('response', response => {
        const requestHeaders = response.request().headers();
        if (
            response.request().method() === 'POST' &&
            requestHeaders['content-type'] && requestHeaders['content-type'].startsWith('application/json')
        ) {
            formSubmitted = true;
        }
    });

    // Submit the form
    await submitbutton.click();

    // Wait for the form submission response
    await page.waitForFunction(() => formSubmitted);

    if (formSubmitted) {
        console.log('Form submitted successfully');
    } else {
        console.log('Form submission failed');
    }
}

async function findcaptchas() {
    const result = {
        captchas: [],
        error: null
    }
    try {
        await this._waitUntilDocumentReady()
        const iframes = [
            ...this._findRegularCheckboxes(),
            ...this._findActiveChallenges()
        ]
        if (!iframes.length) {
            return result
        }
        result.captchas = this._extractInfoFromIframes(iframes)
        iframes.forEach(el => {
            this._paintCaptchaBusy(el)
        })
    } catch (error) {
        result.error = error
        return result
    }
    return result
}


async function _waitUntilDocumentReady() {
    return new Promise(function (resolve) {
        if (!document || !window) return resolve(null)
        const loadedAlready = /^loaded|^i|^c/.test(document.readyState)
        if (loadedAlready) return resolve(null)

        function onReady() {
            resolve(null)
            document.removeEventListener('DOMContentLoaded', onReady)
            window.removeEventListener('load', onReady)
        }

        document.addEventListener('DOMContentLoaded', onReady)
        window.addEventListener('load', onReady)
    })
}

async function _findRegularCheckboxes() {
    const nodeList = document.querySelectorAll < HTMLIFrameElement > (
        this.baseUrls.map(url => `iframe[src*='${url}'][data-hcaptcha-widget-id]:not([src*='invisible'])`).join(',')
    )
    return Array.from(nodeList)
}

/** Find active challenges from invisible hcaptchas */
async function _findActiveChallenges() {
    const nodeList = document.querySelectorAll < HTMLIFrameElement > (
        this.baseUrls.map(url => `div[style*='visible'] iframe[src*='${url}'][src*='hcaptcha.html']`).join(',')
    )
    return Array.from(nodeList)
}

// async function run() {
//     for (let url of urls) {
//         try {
//             await autoforms(url)
//         } catch {

//         }
//     }
// }
//run()


let url = ['https://ilanascaremiami.com/contact-us']
autoforms(url)