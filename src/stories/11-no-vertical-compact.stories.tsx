import React from 'react';
import "../react-grid-layout/css/styles.css";
import "../react-grid-layout/css/example-styles.css";
import NoCompactingLayout from "./11-no-vertical-compact";
export default {
  title: 'Example/NoCompactingLayout',
  Component: NoCompactingLayout,
};

const Template = (args) => <NoCompactingLayout {...args} />;

export const Example = Template.bind({});
Example.args = {

};
