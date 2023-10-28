
module.exports = {

    xpath_placeholders: `//*/input[contains(@placeholder,'')] | //*/textarea[contains(@placeholder,'')]`,

    xpath_labels: '//*/label',

    namelabelxpath: `
//*/label[contains(text(),'name')] | 
//*/label[contains(text(),'Name')] |
//*/label//*[contains(text(),'name')] |
//*/label//*[contains(text(),'Name')]`,

    autocompletenamexpath: `//*[@autocomplete='given-name']`,

    namefieldxpath: `
//*/label[contains(text(),'Name')]/following-sibling::input |
//*/label[contains(text(),'Name')]/following-sibling::*//input |
//*/label[contains(text(),'Name')]/parent::*/following-sibling::*//input | 
//*/label[contains(text(),'Name')]/preceding-sibling::input | 
//*/label[contains(text(),'name')]/preceding-sibling::input | 
//*/label//*[contains(text(),'Name')]/parent::*/following-sibling::*/input | 
//*/label//*[contains(text(),'Name')]/parent::*/following-sibling::*//input |
//*/label//*[contains(text(),'name')]/parent::*/parent::*/following-sibling::*//input`,

    nameplaceholderxpath: `
(//*/input[contains(@name,"name")]) | 
//*/input[contains(@name,"Name")] | 
//*/input[contains(@placeholder,"name")] |
//*/input[contains(@placeholder,"Name")]`,

    lastnamelabelxpath: `
//*/label[contains(text(),'last')] | 
//*/label[contains(text(),'Last')] |
//*/label//*[contains(text(),'last')] |
//*/label//*[contains(text(),'Last')]`,

    autocompletelastnamexpath: `//*[@autocomplete='family-name']`,

    lastnamefieldxpath: `
//*/label[contains(text(),'Last')]/following-sibling::input | 
//*/label[contains(text(),'Last')]/following-sibling::*//input | 
//*/label[contains(text(),'Last')]/preceding-sibling::input | 
//*/label[contains(text(),'last')]/preceding-sibling::input | 
//*/label//*[contains(text(),'Last')]/parent::*/following-sibling::*/input | 
//*/label//*[contains(text(),'Last')]/parent::*/following-sibling::*//input |
//*/label//*[contains(text(),'last')]/parent::*/parent::*/following-sibling::*//input |
//*/label//*[contains(text(),'Last')]/parent::*/parent::*/following-sibling::*//input |
//*/label//*[contains(text(),'Last')]/parent::*/parent::*/parent::*/following-sibling::*`,

    lastnameplaceholderxpath: `
//*/input[contains(@name,"last")] | 
//*/input[contains(@name,"Last")] | 
//*/input[contains(@placeholder,"last")] |
//*/input[contains(@placeholder,"Last")]`,


    companynamelabelxpath: `
//*/label[contains(text(),'Business')] | 
//*/label[contains(text(),'Company')] | 
//*/label//*[contains(text(),'Business')] | 
//*/label//*[contains(text(),'Company')]`,

    companynamefieldxpath: `
//*/label[contains(text(),'Business')]/following-sibling::input | 
//*/label[contains(text(),'Company')]/following-sibling::input | 
//*/label[contains(text(),'Business')]/following-sibling::*//input | 
//*/label[contains(text(),'Company')]/following-sibling::*//input | 
//*/label[contains(text(),'Business')]/preceding-sibling::input | 
//*/label[contains(text(),'Company')]/preceding-sibling::input | 
//*/label//*[contains(text(),'Business')]/parent::*/following-sibling::*/input | 
//*/label//*[contains(text(),'Company')]/parent::*/following-sibling::*//input |
//*/label//*[contains(text(),'Business')]/parent::*/parent::*/following-sibling::*//input |
//*/label//*[contains(text(),'Company')]/parent::*/parent::*/following-sibling::*//input`,

    companynameplaceholderxpath: `
//*/input[contains(@name,"Business")] | 
//*/input[contains(@name,"Company")] | 
//*/input[contains(@placeholder,"Business")] |
//*/input[contains(@placeholder,"Company")] |
//*/input[contains(@name,"business")] | 
//*/input[contains(@name,"company")] | 
//*/input[contains(@placeholder,"business")] |
//*/input[contains(@placeholder,"company")]`,

    subjectlabelxpath: `
//*/label[contains(text(),'Subject')] | 
//*/label[contains(text(),'subject')] | 
//*/label//*[contains(text(),'Subject')] | 
//*/label//*[contains(text(),'subject')]`,

    subjectfieldxpath: `
//*/label[contains(text(),'Subject')]/following-sibling::input | 
//*/label[contains(text(),'subject')]/following-sibling::input | 
//*/label[contains(text(),'Subject')]/following-sibling::*//input | 
//*/label[contains(text(),'subject')]/following-sibling::*//input | 
//*/label[contains(text(),'Subject')]/preceding-sibling::input | 
//*/label[contains(text(),'subject')]/preceding-sibling::input | 
//*/label//*[contains(text(),'Subject')]/parent::*/following-sibling::*/input | 
//*/label//*[contains(text(),'subject')]/parent::*/following-sibling::*//input |
//*/label//*[contains(text(),'Subject')]/parent::*/parent::*/following-sibling::*//input |
//*/label//*[contains(text(),'subject')]/parent::*/parent::*/following-sibling::*//input`,

    subjectplaceholderxpath: `
//*/input[contains(@name,"Subject")] | 
//*/input[contains(@name,"subject")] | 
//*/input[contains(@placeholder,"Subject")] |
//*/input[contains(@placeholder,"subject")]`,

    emaillabelxpath: `
//*/label[contains(text(),'email')] | 
//*/label[contains(text(),'Email')] | 
//*/label//*[contains(text(),'email')] | 
//*/label//*[contains(text(),'Email')]`,

    emailfieldtype: `//*/input[@type='email']`,

    emailfieldxpath: `
//*/label[contains(text(),'email')]/following-sibling::input | 
//*/label[contains(text(),'Email')]/following-sibling::input | 
//*/label[contains(text(),'email')]/following-sibling::*//input | 
//*/label[contains(text(),'Email')]/following-sibling::*//input | 
//*/label[contains(text(),'email')]/preceding-sibling::input | 
//*/label[contains(text(),'Email')]/preceding-sibling::input | 
//*/label//*[contains(text(),'email')]/parent::*/following-sibling::*/input | 
//*/label//*[contains(text(),'Email')]/parent::*/following-sibling::*//input |
//*/label//*[contains(text(),'email')]/parent::*/parent::*/following-sibling::*//input |
//*/label//*[contains(text(),'Email')]/parent::*/parent::*/following-sibling::*//input`,

    emailplaceholderxpath: `
//*/form//input[contains(@name,"email")] | 
//*/form//input[contains(@name,"Email")] | 
//*/form//input[contains(@placeholder,"email")] |
//*/form//input[contains(@placeholder,"Email")]`,

    phonelabelxpath: `
//*/label[contains(text(),'Phone')] | 
//*/label[contains(text(),'phone')] | 
//*/label//*[contains(text(),'Phone')] | 
//*/label//*[contains(text(),'phone')] |
//*/label[contains(@for,'phone')]`,

    phonefieldtype: `//*/input[@type='tel']`,

    phonefieldxpath: `
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
//*/label//*[contains(text(),'Phone')]/parent::*/parent::*/following-sibling::*//input`,

    phoneplaceholderxpath: `
//*/input[contains(@name,"phone")] | 
//*/input[contains(@name,"Phone")] | 
//*/input[contains(@placeholder,"phone")] |
//*/input[contains(@placeholder,"Phone")] |
//*[contains(@placeholder, 'Tel')]`,

    addresslabelxpath: `
//*/label[contains(translate(text(), "ADRES", "adres"),'Address') and not(contains(translate(text(), "EMAIL", "email"),"email"))] |  
//*/label//*[contains(translate(text(), "ADRES", "adres"),'Address') and not(contains(translate(text(), "EMAIL", "email"),"email"))]`,

    addressfieldxpath: `
//*/label[contains(translate(text(), 'ADRES', 'adres'),'address') and not(contains(translate(text(), "EMAIL", "email"),"email"))]/following-sibling::input |
//*/label[contains(translate(text(), 'ADRES', 'adres'),'address') and not(contains(translate(text(), "EMAIL", "email"),"email"))]/following-sibling::*//input |
//*/label[contains(translate(text(), 'ADRES', 'adres'),'address') and not(contains(translate(text(), "EMAIL", "email"),"email"))]/preceding-sibling::input |
//*/label//*[contains(translate(text(), 'ADRES', 'adres'),'address') and not(contains(translate(text(), "EMAIL", "email"),"email"))]/parent::*/following-sibling::*/input | 
//*/label//*[contains(translate(text(), 'ADRES', 'adres'),'Address') and not(contains(translate(text(), "EMAIL", "email"),"email"))]/parent::*/following-sibling::*//input |
//*/label//*[contains(translate(text(), 'ADRES', 'adres'),'address') and not(contains(translate(text(), "EMAIL", "email"),"email"))]/parent::*/parent::*/following-sibling::*//input`,

    addressplaceholderxpath: `
//*/input[contains(@name,"address") and not(contains(@name,"Email"))] |
//*/input[contains(@name,"Address") and not(contains(@name,"Email"))] |
//*/input[contains(@placeholder,"address") and not(contains(translate(@placeholder, "EMAIL", "email"),"email"))] |
//*/input[contains(@placeholder,"Address") and not(contains(translate(@placeholder, "EMAIL", "email"),"email"))]`,

    citylabelxpath: `
//*/label[contains(text(),'City')] | 
//*/label[contains(text(),'city')] | 
//*/label//*[contains(text(),'City')] | 
//*/label//*[contains(text(),'city')]`,

    cityfieldxpath: `
//*/label[contains(text(),'city')]/following-sibling::input | 
//*/label[contains(text(),'City')]/following-sibling::input | 
//*/label[contains(text(),'city')]/following-sibling::*//input | 
//*/label[contains(text(),'City')]/following-sibling::*//input | 
//*/label[contains(text(),'city')]/preceding-sibling::input | 
//*/label[contains(text(),'City')]/preceding-sibling::input | 
//*/label//*[contains(text(),'city')]/parent::*/following-sibling::*/input | 
//*/label//*[contains(text(),'City')]/parent::*/following-sibling::*//input |
//*/label//*[contains(text(),'city')]/parent::*/parent::*/following-sibling::*//input |
//*/label//*[contains(text(),'City')]/parent::*/parent::*/following-sibling::*//input`,

    cityplaceholderxpath: `
//*/input[contains(@name,"city")] | 
//*/input[contains(@name,"City")] | 
//*/input[contains(@placeholder,"city")] |
//*/input[contains(@placeholder,"City")]`,

    statelabelxpath: `
//*/label[contains(text(),'State')] | 
//*/label[contains(text(),'state')] | 
//*/label//*[contains(text(),'State')] | 
//*/label//*[contains(text(),'state')]`,

    statefieldxpath: `
//*/label[contains(text(),'state')]/following-sibling::input | 
//*/label[contains(text(),'State')]/following-sibling::input | 
//*/label[contains(text(),'state')]/following-sibling::*//input | 
//*/label[contains(text(),'State')]/following-sibling::*//input | 
//*/label[contains(text(),'state')]/preceding-sibling::input | 
//*/label[contains(text(),'State')]/preceding-sibling::input | 
//*/label//*[contains(text(),'state')]/parent::*/following-sibling::*/input | 
//*/label//*[contains(text(),'State')]/parent::*/following-sibling::*//input |
//*/label//*[contains(text(),'state')]/parent::*/parent::*/following-sibling::*//input |
//*/label//*[contains(text(),'State')]/parent::*/parent::*/following-sibling::*//input`,

    stateplaceholderxpath: `
//*/input[contains(translate(@name, "STAE", "stae"),"state") and not(@type="hidden")] |
//*/input[contains(translate(@placeholder, "STAE", "stae"),"state")]
`,

    messageTextareaxpath: `//*/textarea`,

    dropdownxpath: `//*/select`,

    submitbuttonxpath: `
    //*/form//button[contains(translate(text(), 'CONTACT', 'contact'),'contact') or contains(translate(text(), 'SUBMIT', 'submit'),'submit') or contains(translate(text(), 'SEND', 'send'),'send')] |
    //*/input[translate(@type, 'SUBMIT', 'submit')='submit' and (contains(translate(@value, 'SUBMIT', 'submit'),'submit') or contains(translate(@value, 'SEND', 'send'),'send' ))] |
    //*/button[contains(translate(text(), 'SEND', 'send'), 'send') or contains(translate(text(), 'SUBMIT', 'submit'), 'submit')] |
    //*/button//*[contains(translate(text(), 'SEND', 'send'), 'send') or contains(translate(text(), 'SUBMIT', 'submit'), 'submit')]/ancestor::button |
    //form//a//*[contains(translate(text(),'SEND','send'),'send') or contains(translate(text(), 'SUBMIT', 'submit'),'submit')] |
    //form//a[contains(translate(text(),'SEND','send'),'send') or contains(translate(text(), 'SUBMIT', 'submit'),'submit')]
    `,

    capchaxpath: `
    //*/form//img[@alt='captcha'] | 
//*/form//iframe[@title='reCAPTCHA'] | 
//form//*[contains(text(),'reCAPTCHA')]`,

}