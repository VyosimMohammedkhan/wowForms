import { useEffect, useState } from 'react';
import React from "react"
import { TransformWrapper, TransformComponent } from "react-zoom-pan-pinch";
import Carousel from 'react-bootstrap/Carousel';
import { ProgressBar } from "react-bootstrap";
import FormfieldsGrid from './FormfieldsGrid';
import 'bootstrap/dist/css/bootstrap.css';
import axios from 'axios'
import './App.css';
import * as mdb from 'mdb-ui-kit'
export default function FormsFiller() {
  const [contactformurl, setContactFormurl] = useState('wowleads.com');
  const [firstname, setFirstname] = useState('Sandesh');
  const [lastname, setLastname] = useState('roop');
  const [fullname, setFullname] = useState('Sandhesh A Roop');
  const [phone, setPhone] = useState('8291430502');
  const [email, setEmail] = useState('sandeshroop@gmail.com');
  const [company, setCompany] = useState('Roop fillers limited');
  const [website, setWebsite] = useState('roopsandesh.com');
  const [address, setAddress] = useState('Andheri');
  const [city, setCity] = useState('Mumbai');
  const [state, setState] = useState('Maharashtra');
  const [zip, setZip] = useState(400061);
  const [country, setCountry] = useState('India');
  const [subject, setSubject] = useState('Appreciation');
  const [message200, setMessage200] = useState('Hi, you did a good job with the website design. Keep it up!!!!');
  const [message400, setMessage400] = useState('Hi, you did a good job with the website design. Keep it up!!!!');
  const [message1000, setMessage1000] = useState('Hi, you did a good job with the website design. Keep it up!!!!');
  const [messageNoLimit, setMessageNoLimit] = useState('Hi, you did a good job with the website design. Keep it up!!!!');
  const [roleTitle, setRoleTitle] = useState('Marketing Associate')
  const [bestTimeToRespond, setBestTimeToRespond] = useState('immediately')
  const [date, setDate] = useState('10/10/2022')
  const [unidentified, setUnidentified] = useState(123)
  const [submitEnabled, setSubmitEnabled] = useState(false)
  const [processing, setProcessing] = useState(false)
  const [progress, setProgress] = useState(0)
  const [progressInfo, setProgressInfo] = useState("this is progress info")
  const [result, setResult] = useState([])

  const sendDataToBackend = async () => {
    setResult([])
    setProcessing(true)
    setProgress(0)
    try {
      let formdata = getformdata()
      let url = getformurl()

      const socket = new WebSocket('ws://localhost:5000/fillform');

      socket.onopen = () => {
        const data = { formurl: url, formdata: formdata, submitEnabled: submitEnabled }
        socket.send(JSON.stringify(data));
      }

      socket.onmessage = async event => {
        const data = (await JSON.parse(event.data))
        if (data.url) {
          console.log('getting data for :', data.url)
          const response = await axios.get('http://localhost:5000/getformfields', { params: { url: data.url } })
          const dbformdata = response.data
          console.log('response :', dbformdata)
          setResult(prevdata => [...prevdata, dbformdata])
        }

        if (data.progress)
          setProgress(data.progress)

        if (data.progressInfo)
          setProgressInfo(data.progressInfo)
      }

      socket.onclose = event => {
        setProcessing(false)
      }





    } catch (err) {
      console.log("Error while sending form data", err);
    }
  };


  function getformurl() {
    return contactformurl
  }

  function getformdata() {
    const formdata = {
      firstname: firstname,
      lastname: lastname,
      fullname: fullname,
      phone: phone,
      email: email,
      company: company,
      website: website,
      address: address,
      city: city,
      state: state,
      zip: zip,
      country: country,
      subject: subject,
      message200: message200,
      message400: message400,
      message1000: message1000,
      messageNoLimit: messageNoLimit,
      roleTitle: roleTitle,
      bestTimeToRespond: bestTimeToRespond,
      date: date,
      unidentified: unidentified
    }

    return JSON.stringify(formdata);
  }

  const getFormFields = (fields) => {
    console.log('got data from child :', fields)
    setResult(fields)
  }

  const handleSubmitState = () => {
    console.log("previous:", submitEnabled)
    setSubmitEnabled(!submitEnabled);
    console.log("current:", submitEnabled)
  };

  const handleFormUrl = (event) => {
    setContactFormurl(event.target.value);
  };

  const handleFirstName = (event) => {
    setFirstname(event.target.value);
  };

  const handleLastName = (event) => {
    setLastname(event.target.value);
  };

  const handleFullname = (event) => {
    setFullname(event.target.value);
  };

  const handlePhone = (event) => {
    setPhone(event.target.value);
  };

  const handleEmail = (event) => {
    setEmail(event.target.value);
  };

  const handleCompany = (event) => {
    setCompany(event.target.value);
  };

  const handleWebsite = (event) => {
    setWebsite(event.target.value);
  };

  const handleAddress = (event) => {
    setAddress(event.target.value);
  };

  const handleCity = (event) => {
    setCity(event.target.value);
  };

  const handleState = (event) => {
    setState(event.target.value);
  };

  const handleZip = (event) => {
    setZip(event.target.value);
  };

  const handleCountry = (event) => {
    setCountry(event.target.value);
  };

  const handleSubject = (event) => {
    setSubject(event.target.value);
  };


  const handleMessage200 = (event) => {
    setMessage200(event.target.value);
  };


  const handleMessage400 = (event) => {
    setMessage400(event.target.value);
  };


  const handleMessage1000 = (event) => {
    setMessage1000(event.target.value);
  };

  const handleMessageNoLimit = (event) => {
    setMessageNoLimit(event.target.value);
  };

  const handleRoleTitle = (event) => {
    setRoleTitle(event.target.value)
  }

  const handleBestTimeToRespond = (event) => {
    setBestTimeToRespond(event.target.value)
  }

  const handleDate = (event) => {
    setDate(event.target.value)
  }

  const handleUnidentified = (event) => {
    setUnidentified(event.target.value);
  };

  const screeenshotRenderer = () => {
    const path = './images/';
    return (<Carousel controls indicators interval='1000000000'>
      {result.map(form => {
        // if (form.Complete == true)
        try {
          return (

            <Carousel.Item>
              <TransformWrapper>
                <TransformComponent>
                  <img
                    className="d-block w-100"
                    src={require(`${path}${form.screenshot_name}before.jpeg`)}
                    alt={'screenshot for ' + form.screenshot_name}
                  />
                  <Carousel.Caption className="d-none d-md-block">
                    <p style={{color:'black', backgroundColor:'whitesmoke'}}>{form.screenshot_name}</p>
                  </Carousel.Caption>
                </TransformComponent>
              </TransformWrapper>
            </Carousel.Item>
          )
        } catch {
          return (
            <Carousel.Item>
              <TransformWrapper>
                <TransformComponent>
                  <img
                    className="d-block w-100"
                    src={require(`${path}notfound.jpeg`)}
                    alt={'screenshot not available for selected domain'}
                  />
                   <Carousel.Caption className="d-none d-md-block">
                    <p style={{color:'black', backgroundColor:'whitesmoke'}}>This page failed to load</p>
                  </Carousel.Caption>
                </TransformComponent>
              </TransformWrapper>
            </Carousel.Item>
          )
        }
      })}
    </Carousel>)
  }

  const fieldsTableRenderer = () => {
    console.log(result)
    return (<tbody>
      {result.map((form, index) => {
        // if (form.Complete == true)
        return (<>
        <tr className="accordion-toggle collapsed"
          key={index}
          id={"accordion"+index}
          data-mdb-toggle="collapse"
          data-mdb-parent={"#accordion"+index}
          href={"#collapseOne"+index}
          aria-controls={"collapseOne"+index}
        >
          <td className="expand-button"></td>
          <td width={'100px'}>{form.url}</td>
          <td>{form.captcha ? "Y" : "N"}</td>
          <td>{form.fields.length > 1 ? "Successful" : "Failed"}</td>
          <td>{form.submit_status}</td>
        </tr>

          <tr className="hide-table-padding">
            <td></td>
            <td colspan="3">
              <div id={"collapseOne"+index} className="collapse in p-3">
                <div style={{ border: '1px ridge', borderRadius: '2%', padding: '2%' }}>
                  <div className="row" style={{ borderBottom: 'ridge' }}>
                    <div className="col-2">Form No.</div>
                    <div className="col-3">FieldName</div>
                    <div className="col-3">Required</div>
                    <div className="col-4">Identity</div>
                  </div>
                  {(form.fields).map((field) => {
                    return (
                      <div className="row" style={{ borderTop: '0.5px solid' }}>
                        <div className="col-2">{field.form_number}</div>
                        <div className="col-4">{field.field_name}</div>
                        <div className="col-2">{field.isrequired ? "YES" : "No"}</div>
                        {/* <div className="col-2">{field.fieldFilled ? "YES" : "No"}</div> */}
                        <div className="col-3">{field.identity}</div>
                      </div>
                    )
                  })}
                </div>
              </div>
            </td>
          </tr>
        </>
        )
      })}
    </tbody>)
  }

  return (<>
    <nav className="navbar navbar-expand-lg bg-body-tertiary">
      <div className="container-fluid text-center">
        <a className="navbar-brand" href="#">wowForms</a>

        <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav" aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation">
          <span className="navbar-toggler-icon"></span>
        </button>
        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav">
            {/* <li className="nav-item">
              <a className="nav-link active" aria-current="page" href="#">Home</a>
            </li> */}
          </ul>
        </div>
      </div>
    </nav>


    <div className='container-fluid p-4'>
      <div className='row'>

        <div className='col-8' style={{ height: '75vh' }}>
          <div className='row h-50 '>
            <div className='col-4 overflow-auto border py-3 h-100'>
              <div style={{ height: '3vh' }}>{processing ? (<>
                <ProgressBar now={progress} label={`${progress}% completed`} animated />
              </>) : (<>

              </>)}
              </div>
              <form id="myForm" action="#" method="post" autoComplete="off">
                <div className='row'>
                  <div className='col-5'><h5 className="title">Form Data</h5></div>
                  <div className='col-4'>
                    <div class="form-check form-switch">
                      <input class="form-check-input" type="checkbox" id="submitSwitch" onChange={handleSubmitState} />
                      <label class="form-check-label" for="submitSwitch">Submit</label>
                    </div>
                  </div>
                  <div className='col-3 '><input className="" type="button" value="START" id="submitButton" onClick={sendDataToBackend} /></div>
                </div>
                <div className="input-container">
                  <div className='row'>
                    <div className='col-5'><label htmlFor="formurl">Form Url</label></div>
                    <div className='col-7'><textarea value={contactformurl} onChange={handleFormUrl} type="text" name="formurl" className="input" id="formurl" required="" cols={15} /></div>
                  </div>
                </div>

                <div className="input-container">
                  <div className='row'>
                    <div className='col-5'><label htmlFor="firstname">First Name</label></div>
                    <div className='col-7'><input value={firstname} onChange={handleFirstName} type="text" name="firstname" className="input" id="firstname" required="" size={15} /></div>
                  </div>
                </div>

                <div className="input-container">
                  <div className='row'>
                    <div className='col-5'><label htmlFor="firstname">Last Name</label></div>
                    <div className='col-7'><input value={lastname} onChange={handleLastName} type="text" name="lastname" className="input" id="lastname" required="" size={15} /></div>
                  </div>
                </div>

                <div className="input-container">
                  <div className='row'>
                    <div className='col-5'><label htmlFor="firstname">Full Name</label></div>
                    <div className='col-7'><input value={fullname} onChange={handleFullname} type="text" name="fullname" className="input" id="fullname" required="" size={15} /></div>
                  </div>
                </div>

                <div className="input-container">
                  <div className='row'>
                    <div className='col-5'><label htmlFor="phone">Phone</label></div>
                    <div className='col-7'><input value={phone} onChange={handlePhone} type="tel" name="phone" className="input" id="phone" required="" size={15} /></div>
                  </div>
                </div>

                <div className="input-container">
                  <div className='row'>
                    <div className='col-5'><label htmlFor="email">Email*</label></div>
                    <div className='col-7'><input value={email} onChange={handleEmail} type="email" name="email" className="input" id="email" required="" size={15} /></div>
                  </div>
                </div>

                <div className="input-container">
                  <div className='row'>
                    <div className='col-5'><label htmlFor="company">Company</label></div>
                    <div className='col-7'><input value={company} onChange={handleCompany} type="text" name="company" className="input" id="company" required="" size={15} /></div>
                  </div>
                </div>

                <div className="input-container">
                  <div className='row'>
                    <div className='col-5'><label htmlFor="website">Website</label></div>
                    <div className='col-7'><input value={website} onChange={handleWebsite} type="text" name="website" className="input" id="website" required="" size={15} /></div>
                  </div>
                </div>

                <div className="input-container">
                  <div className='row'>
                    <div className='col-5'><label htmlFor="address">Address</label></div>
                    <div className='col-7'><input value={address} onChange={handleAddress} type="text" name="address" className="input" id="address" required="" size={15} /></div>
                  </div>
                </div>

                <div className="input-container">
                  <div className='row'>
                    <div className='col-5'><label htmlFor="city">City</label></div>
                    <div className='col-7'><input value={city} onChange={handleCity} type="text" name="city" className="input" id="city" required="" size={15} /></div>
                  </div>
                </div>

                <div className="input-container">
                  <div className='row'>
                    <div className='col-5'><label htmlFor="state">State</label></div>
                    <div className='col-7'><input value={state} onChange={handleState} type="text" name="state" className="input" id="state" required="" size={15} /></div>
                  </div>
                </div>

                <div className="input-container">
                  <div className='row'>
                    <div className='col-5'><label htmlFor="zip">Zip code</label></div>
                    <div className='col-7'><input value={zip} onChange={handleZip} type="text" name="zip" className="input" id="zip" required="" pattern="\d{5,6}" size={15} /></div>
                  </div>
                </div>

                <div className="input-container">
                  <div className='row'>
                    <div className='col-5'><label htmlFor="country">Country</label></div>
                    <div className='col-7'><input value={country} onChange={handleCountry} type="text" name="country" className="input" id="country" required="" size={15} /></div>
                  </div>
                </div>

                <div className="input-container">
                  <div className='row'>
                    <div className='col-5'><label htmlFor="subject">Subject</label></div>
                    <div className='col-7'><input value={subject} onChange={handleSubject} type="text" name="subject" className="input" id="subject" required="" size={15} /></div>
                  </div>
                </div>

                <div className="input-container">
                  <div className='row'>
                    <div className='col-5'><label htmlFor="message200">Message (200)</label></div>
                    <div className='col-7'><textarea value={message200} onChange={handleMessage200} name="message200" className="input" id="message200" required="" maxLength={200} cols={15} /></div>
                  </div>
                </div>

                <div className="input-container">
                  <div className='row'>
                    <div className='col-5'><label htmlFor="message400">Message (400)</label></div>
                    <div className='col-7'><textarea value={message400} onChange={handleMessage400} name="message400" className="input" id="message400" required="" maxLength={400} cols={15} /></div>
                  </div>
                </div>

                <div className="input-container">
                  <div className='row'>
                    <div className='col-5'><label htmlFor="message1000">Message (1000)</label></div>
                    <div className='col-7'><textarea value={message1000} onChange={handleMessage1000} name="message1000" className="input" id="message1000" required="" maxLength={1000} cols={15} /></div>
                  </div>
                </div>

                <div className="input-container">
                  <div className='row'>
                    <div className='col-5'><label htmlFor="messageNoLimit">Message noLimit</label></div>
                    <div className='col-7'><textarea value={messageNoLimit} onChange={handleMessageNoLimit} name="messageNoLimit" className="input" id="messageNoLimit" required="" cols={15} /></div>
                  </div>
                </div>

                <div className="input-container">
                  <div className='row'>
                    <div className='col-5'><label htmlFor="roleTitle">Role Title</label></div>
                    <div className='col-7'><input value={roleTitle} onChange={handleRoleTitle} type="text" name="roleTitle" className="input" id="roleTitle" required="" size={15} /></div>
                  </div>
                </div>

                <div className="input-container">
                  <div className='row'>
                    <div className='col-5'><label htmlFor="bestTimeToRespond">Best Time To Respond</label></div>
                    <div className='col-7'><input value={bestTimeToRespond} onChange={handleBestTimeToRespond} type="text" name="bestTimeToRespond" className="input" id="bestTimeToRespond" required="" size={15} /></div>
                  </div>
                </div>

                <div className="input-container">
                  <div className='row'>
                    <div className='col-5'><label htmlFor="date">Date</label></div>
                    <div className='col-7'><input value={date} onChange={handleDate} type="text" name="date" className="input" id="date" required="" size={15} /></div>
                  </div>
                </div>

                <div className="input-container">
                  <div className='row'>
                    <div className='col-5'><label htmlFor="unidentified">unidentified</label></div>
                    <div className='col-7'><input value={unidentified} onChange={handleUnidentified} type="text" name="unidentified" className="input" id="unidentified" required="" size={15} /></div>
                  </div>
                </div>

              </form>
            </div>



            <div className='col-8 overflow-auto border py-3 h-100'>
              <div className="table-responsive">
                <table className="table">
                  <thead>
                    <tr>
                      <th scope="col">#</th>
                      <th scope="col">Form URL</th>
                      <th scope="col">Captcha</th>
                      <th scope="col">Fill Status</th>
                      <th scope="col">Submit Status</th>
                    </tr>
                  </thead>
                  {fieldsTableRenderer()}
                </table>
              </div>
            </div>
          </div>


          <div className='row h-90 mt-3 border'>
            <FormfieldsGrid getFormFields={getFormFields} />
          </div>



        </div>
        {/* ================================================================================================================ */}



        <div className='col-4 overflow-auto' style={{ height: '85vh' }}>
          {screeenshotRenderer()}
        </div>
      </div>
    </div>

    <div className='position-fixed bottom-0 start-0 ' style={{ zIndex: '1000', opacity: '1', backgroundColor: 'whitesmoke' }}>
      <span className='border border-top-0 border-1 rounded'>{progressInfo}</span>
    </div>
  </>)
};


