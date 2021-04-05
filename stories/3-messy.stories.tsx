import React from 'react';
import "../css/styles.css";
import "../css/example-styles.css";
import MessyLayout from "./3-messy";

export default {
  title: 'Example/MessyLayout',
  Component: MessyLayout,
};

const Template = (args) => <MessyLayout {...args} />;

export const Example = Template.bind({});
Example.args = {

};
