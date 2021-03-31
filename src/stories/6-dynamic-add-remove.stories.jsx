import React from 'react';
import "../react-grid-layout/css/styles.css";
import "../react-grid-layout/css/example-styles.css";
import AddRemoveLayout from "./6-dynamic-add-remove";

export default {
  title: 'Example/AddRemoveLayout',
  Component: AddRemoveLayout,
};

const Template = (args) => <AddRemoveLayout {...args} />;

export const Example = Template.bind({});
Example.args = {

};
