import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { Card, Image } from 'react-bootstrap';
/** Renders a single row in the List Stuff table. See pages/ListStuff.jsx. */
const Item = ({ item }) => (
  <Card className="h-100">
    <Card.Header>
      <Image src={item.image} width={75} />
      <Card.Title>{item.firstName} {item.lastName}</Card.Title>
      <Card.Subtitle>{item.address}</Card.Subtitle>
    </Card.Header>
    <Card.Body>
      <Card.Text>{item.description}</Card.Text>
      <Link to={`/edit/${item._id}`}>Edit</Link>
    </Card.Body>
  </Card>
);

// Require a document to be passed to this component.
Item.propTypes = {
  contact: PropTypes.shape({
    firstName: PropTypes.string,
    lastName: PropTypes.string,
    address: PropTypes.string,
    image: PropTypes.string,
    description: PropTypes.string,
    _id: PropTypes.string,
  }).isRequired,
};

export default Item;