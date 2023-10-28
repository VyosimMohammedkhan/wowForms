import { useEffect, useState } from 'react';
import React from "react"
import { TransformWrapper, TransformComponent } from "react-zoom-pan-pinch";
import Carousel from 'react-bootstrap/Carousel';
import 'bootstrap/dist/css/bootstrap.css';
import axios from 'axios'
import './App.css';
import * as mdb from 'mdb-ui-kit'
export default function FormsFiller() {
  const [contactformurl, setContactFormurl] = useState('wowleads.com');
  const [firstname, setFirstname] = useState('testfirstname');
  const [lastname, setLastname] = useState('testlastname');
  const [fullname, setFullname] = useState('testfullname');
  const [phone, setPhone] = useState(1234567890);
  const [email, setEmail] = useState('testemail@gmail.com');
  const [company, setCompany] = useState('vyosim limited');
  const [website, setWebsite] = useState('vyosim.com');
  const [address, setAddress] = useState('test address');
  const [city, setCity] = useState('testcity');
  const [state, setState] = useState('teststate');
  const [zip, setZip] = useState(123456);
  const [country, setCountry] = useState('testCountry');
  const [subject, setSubject] = useState('test subject');
  const [message, setMessage] = useState('test message');
  const [result, setResult] = useState([])

  const sendDataToBackend = () => {

    try {
      let formdata = getformdata()
      let url = getformurl()

      const request = {
        url: `http://localhost:5000/fillform`,
        method: 'POST',
        data: {
          formurl: url,
          formdata: formdata
        }
      };
      axios(request)
        .then((response) => {
          console.log(response.data)
          setResult(response.data)
        })
        .catch(err => console.log('got axios error'))

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
      message: message,
    }

    return JSON.stringify(formdata);
  }

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

  const handleMessage = (event) => {
    setMessage(event.target.value);
  };

  const screeenshotRenderer = () => {
    const path = './images/';
    return (<Carousel controls indicators interval='1000000000'>
      {result.map(form => {
        if (form.Complete==true)
          return (

            <Carousel.Item>
              <TransformWrapper>
                <TransformComponent>
                  <img
                    className="d-block w-100"
                    src={require(`${path}${form.screenshot}before.jpeg`)}
                    alt={'screenshot for ' + form.screenshot}
                  />
                  <Carousel.Caption className="d-none d-md-block">
                    <p>{form.screenshot}</p>
                  </Carousel.Caption>
                </TransformComponent>
              </TransformWrapper>
            </Carousel.Item>

          )
      })}
    </Carousel>)
  }

  const fieldsTableRenderer = () => {
    return (<tbody>
      {result.map((form, index) => {
        if (form.Complete==true)
          return (<><tr className="accordion-toggle collapsed"
            key={index}
            id="accordion1"
            data-mdb-toggle="collapse"
            data-mdb-parent="#accordion1"
            href="#collapseOne"
            aria-controls="collapseOne"
          >
            <td className="expand-button"></td>
            <td>{form.url}</td>
            <td>{(form.formfound && form.submitButtonFound) ? "Success" : "failed"}</td>
            <td>{form.captchaFound ? "YES" : "NO"}</td>
          </tr>

            <tr className="hide-table-padding">
              <td></td>
              <td colspan="3">
                <div id="collapseOne" className="collapse in p-3">
                  <div style={{ border: '1px ridge', borderRadius: '2%', padding: '2%' }}>
                    <div className="row" style={{ borderBottom: 'ridge' }}>
                      <div className="col-3">FieldName</div>
                      <div className="col-3">Required</div>
                      <div className="col-2">Filled</div>
                      <div className="col-4">Identity</div>
                    </div>
                    {(form.textInputs).map((field) => {
                      return (
                        <div className="row" style={{ borderTop: '0.5px solid' }}>
                          <div className="col-3">{field.fieldName}</div>
                          <div className="col-3">{field.isrequired ? "YES" : "No"}</div>
                          <div className="col-2">{field.fieldFilled ? "YES" : "No"}</div>
                          <div className="col-4">{field.result}</div>
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


    <div className='container-fluid' style={{ padding: '2%' }}>
      <div className='row'>

        <div className='col-3' style={{ height: '90%' }}>
          <form id="myForm" action="#" method="post" autoComplete="off">
            <h3 className="title">Form Data</h3>

            <div className="input-container">
              <div className='row'>
                <div className='col-3'><label htmlFor="formurl">Form Url</label></div>
                <div className='col-7'><input value={contactformurl} onChange={handleFormUrl} type="text" name="formurl" className="input" id="formurl" required="" /></div>
              </div>
            </div>

            <div className="input-container">
              <div className='row'>
                <div className='col-3'><label htmlFor="firstname">First Name</label></div>
                <div className='col-7'><input value={firstname} onChange={handleFirstName} type="text" name="firstname" className="input" id="firstname" required="" /></div>
              </div>
            </div>

            <div className="input-container">
              <div className='row'>
                <div className='col-3'><label htmlFor="firstname">Last Name</label></div>
                <div className='col-7'><input value={lastname} onChange={handleLastName} type="text" name="lastname" className="input" id="lastname" required="" /></div>
              </div>
            </div>

            <div className="input-container">
              <div className='row'>
                <div className='col-3'><label htmlFor="firstname">Full Name</label></div>
                <div className='col-7'><input value={fullname} onChange={handleFullname} type="text" name="fullname" className="input" id="fullname" required="" /></div>
              </div>
            </div>

            <div className="input-container">
              <div className='row'>
                <div className='col-3'><label htmlFor="phone">Phone</label></div>
                <div className='col-7'><input value={phone} onChange={handlePhone} type="tel" name="phone" className="input" id="phone" required="" /></div>
              </div>
            </div>

            <div className="input-container">
              <div className='row'>
                <div className='col-3'><label htmlFor="email">Email*</label></div>
                <div className='col-7'><input value={email} onChange={handleEmail} type="email" name="email" className="input" id="email" required="" /></div>
              </div>
            </div>

            <div className="input-container">
              <div className='row'>
                <div className='col-3'><label htmlFor="company">Company</label></div>
                <div className='col-7'><input value={company} onChange={handleCompany} type="text" name="company" className="input" id="company" required="" /></div>
              </div>
            </div>

            <div className="input-container">
              <div className='row'>
                <div className='col-3'><label htmlFor="website">Website</label></div>
                <div className='col-7'><input value={website} onChange={handleWebsite} type="text" name="website" className="input" id="website" required="" /></div>
              </div>
            </div>

            <div className="input-container">
              <div className='row'>
                <div className='col-3'><label htmlFor="address">Address</label></div>
                <div className='col-7'><input value={address} onChange={handleAddress} type="text" name="address" className="input" id="address" required="" /></div>
              </div>
            </div>

            <div className="input-container">
              <div className='row'>
                <div className='col-3'><label htmlFor="city">City</label></div>
                <div className='col-7'><input value={city} onChange={handleCity} type="text" name="city" className="input" id="city" required="" /></div>
              </div>
            </div>

            <div className="input-container">
              <div className='row'>
                <div className='col-3'><label htmlFor="state">State</label></div>
                <div className='col-7'><input value={state} onChange={handleState} type="text" name="state" className="input" id="state" required="" /></div>
              </div>
            </div>

            <div className="input-container">
              <div className='row'>
                <div className='col-3'><label htmlFor="zip">Zip code</label></div>
                <div className='col-7'><input value={zip} onChange={handleZip} type="text" name="zip" className="input" id="zip" required="" pattern="\d{5,6}" /></div>
              </div>
            </div>

            <div className="input-container">
              <div className='row'>
                <div className='col-3'><label htmlFor="country">Country</label></div>
                <div className='col-7'><input value={country} onChange={handleCountry} type="text" name="country" className="input" id="country" required="" /></div>
              </div>
            </div>

            <div className="input-container">
              <div className='row'>
                <div className='col-3'><label htmlFor="subject">Subject</label></div>
                <div className='col-7'><input value={subject} onChange={handleSubject} type="text" name="subject" className="input" id="subject" required="" /></div>
              </div>
            </div>

            <div className="input-container">
              <div className='row'>
                <div className='col-3'><label htmlFor="message">Message</label></div>
                <div className='col-7'><textarea value={message} onChange={handleMessage} name="message" className="input" id="message" required="" /></div>
              </div>
            </div>

            <input className="contactbtn" type="button" value="Autofill form" id="submitButton" onClick={sendDataToBackend} />
          </form>
        </div>



        <div className='col-5' style={{ height: '80vh', overflowY: 'scroll' }}>
          <div className="table-responsive">
            <table className="table">
              <thead>
                <tr>
                  <th scope="col">#</th>
                  <th scope="col">Form URL</th>
                  <th scope="col">Status</th>
                  <th scope="col">captcha</th>
                </tr>
              </thead>
              {fieldsTableRenderer()}
            </table>
          </div>
        </div>




        <div className='col-4' style={{ height: '80vh', overflowY: 'scroll' }}>
          {screeenshotRenderer()}
        </div>
      </div>
    </div>
  </>)
};


