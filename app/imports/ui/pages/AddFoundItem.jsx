import React, { useState } from 'react';
import { Button, Card, Col, Container, Row } from 'react-bootstrap';
import { AutoForm, ErrorsField, LongTextField, SelectField, SubmitField, TextField } from 'uniforms-bootstrap5';
import swal from 'sweetalert';
import { Meteor } from 'meteor/meteor';
import SimpleSchema2Bridge from 'uniforms-bridge-simple-schema-2';
import SimpleSchema from 'simpl-schema';
import { FoundItems } from '../../api/item/FoundItems';
import { Images } from '../../api/item/Images';

const isValidEmail = (value) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(value) || value.length === 0;
};

// Create a schema to specify the structure of the data to appear in the form.
const formSchema = new SimpleSchema({
  itemName: String,
  category: {
    type: String,
    allowedValues: ['Electronics', 'Identification and Access Cards', 'Clothing and Accessories', 'Food and Drink Containers', 'Textbooks and School Supplies', 'Miscellaneous'],
    defaultValue: 'Miscellaneous',
  },
  description: String,
  locationFound: String,
  contactEmail: {
    defaultValue: Meteor.user() ? Meteor.user().username : '',
    type: String,
    // eslint-disable-next-line consistent-return
    custom() {
      if (!isValidEmail(this.value)) {
        return 'Invalid';
      }
    },
    required: false,
  },
});

const bridge = new SimpleSchema2Bridge(formSchema);

/* Renders the AddFoundItem page for adding a document. */
const AddFoundItem = () => {
  const [encodedPhotoRefs, setEncodedPhotoRefs] = useState([]);

  // On submit, insert the data.
  const submit = (data, formRef) => {
    const { itemName, category, description, locationFound, contactEmail } = data;
    let processedEmail;
    if (!contactEmail) {
      processedEmail = Meteor.user().username;
    } else {
      processedEmail = contactEmail;
    }
    const owner = Meteor.user().username;
    // upload images.
    const imageRefArray = [];
    // default back to stock image if no image uploaded.
    if (encodedPhotoRefs.length > 0) {
      for (let i = 0; i < encodedPhotoRefs.length; i++) {
        Images.collection.insert({
          owner: owner,
          data: encodedPhotoRefs[i].data,
        }, (err, doc) => {
          if (err) {
            swal(err);
          } else {
            imageRefArray.push(doc);
            if (imageRefArray.length === encodedPhotoRefs.length) {
              // all the IDs of the images are obtained, now add these IDs to the FoundItem.
              FoundItems.collection.insert(
                { itemName, category, description, locationFound, contactEmail: processedEmail, owner, image: imageRefArray, dateReported: new Date() },
                (error) => {
                  if (error) {
                    swal('Error', error.message, 'error');
                  } else {
                    swal('Success', 'Item added successfully', 'success');
                    formRef.reset();
                  }
                  // CALLBACK HELL!!! WOOHOO!!!! #plzdon'tdeductgrade
                },
              );
            }
          }
        });
      }
    } else {
      Images.collection.insert({
        owner: owner,
        data: 'https://www.generationsforpeace.org/wp-content/uploads/2018/03/empty.jpg',
      }, (err, doc) => {
        if (err) {
          swal(err);
        } else {
          imageRefArray.push(doc);
          FoundItems.collection.insert(
            { itemName, category, description, locationFound, contactEmail: processedEmail, owner, image: imageRefArray, dateReported: new Date() },
            (error) => {
              if (error) {
                swal('Error', error.message, 'error');
              } else {
                swal('Success', 'Item added successfully', 'success');
                formRef.reset();
              }
              // CALLBACK HELL!!! WOOHOO!!!! #plzdon'tdeductgrade
            },
          );
        }
      });
    }
  };

  function changeImage(e) {
    const file = e.target.files[0];
    const src = URL.createObjectURL(file);
    const size = file.size;
    const fr = new FileReader();
    fr.addEventListener('load', (event) => {
      const text = event.target.result;
      if (size >= 8388608) {
        // If more than 8mb, reject and display err message.
        swal('Please upload a smaller image!', `Max image size is 8mb; you've uploaded ${(size / 1048576).toFixed(2)}mb`, 'error');
      } else {
        // If under 4mb, allow.
        const tempArray = [...encodedPhotoRefs];
        tempArray.push({ data: text.toString(), shown: false, src: src });
        setEncodedPhotoRefs(tempArray);
      }
    });
    fr.readAsDataURL(file);
  }

  function removeImage(e) {
    const tempArr = [...encodedPhotoRefs];
    const toDelete = e.target.name;
    const index = tempArr.map(item => item.src).indexOf(toDelete);
    tempArr.splice(index, 1);
    setEncodedPhotoRefs(tempArr);
  }

  // Render the form. Use Uniforms: https://github.com/vazco/uniforms
  let fRef = null;
  return (
    <Container id="add-found-page" className="py-3" style={{ marginBottom: '100px' }}>
      <Row className="justify-content-center">
        <Col xs={10}>
          <Col className="text-center" style={{ marginBottom: '40px' }}>
            <h2 className="add-found-item-heading">Add a Found Item</h2>
            <p className="text-center" style={{ color: 'white' }}>Came across an item you think may be lost on campus? Post it here.</p>
          </Col>
          <AutoForm ref={ref => { fRef = ref; }} schema={bridge} onSubmit={data => submit(data, fRef)}>
            <Card>
              <Card.Body>
                <Row>
                  <Col><TextField id="found-name" name="itemName" /></Col>
                </Row>
                <LongTextField id="found-desc" name="description" />
                <div className="ImageField">
                  {/* eslint-disable-next-line jsx-a11y/label-has-associated-control */}
                  <div>
                    <div>Upload your photos</div>
                    <div style={{ width: 'auto', margin: '3% 0 3% 0' }}>
                      {encodedPhotoRefs.map(e => (
                        <div style={{ display: 'inline-block', margin: '0% 2% 3% 2%' }} key={e.src}>
                          <img src={e.data} key={e} alt="" style={{ height: '10vw', width: '10vw' }} />
                          <br />
                          <Button variant="danger" key={e.src} name={e.src} style={{ textAlign: 'center', width: '80%', margin: '5% 10% 5% 10%' }} onClick={(evt) => removeImage(evt)}>Remove</Button>
                        </div>
                      ))}
                    </div>
                  </div>
                  <input
                    accept="image/*"
                    id="file-input"
                    type="file"
                    onChange={(e) => changeImage(e)}
                  />
                </div>
                <Row>
                  <Col>
                    <SelectField id="found-cat" name="category" />
                  </Col>
                  <Col>
                    <LongTextField id="found-location" name="locationFound" placeholder="e.g. Found at 9:30am at Campus Center Food Court on May 1, 2024" />
                  </Col>
                </Row>
                <Col>
                  <TextField id="found-email" name="contactEmail" label="If you'd like to recieve notifications on another email, please enter it here: " />
                </Col>
                <SubmitField id="submit-btn" value="Submit" />
                <ErrorsField />
              </Card.Body>
            </Card>
          </AutoForm>
        </Col>
      </Row>
    </Container>
  );
};

export default AddFoundItem;
