import React from 'react';
import "../css/styles.css";
import "../css/example-styles.css";
import AddRemoveLayout from "./6-dynamic-add-remove";

export default {
  title: 'Example/AddRemoveLayout',
  Component: AddRemoveLayout,
};

const Template = (args) => <AddRemoveLayout {...args} />;

export const Example = Template.bind({});
Example.args = {

};
