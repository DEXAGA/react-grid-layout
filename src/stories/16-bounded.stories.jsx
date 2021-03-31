import React from 'react';
import "../react-grid-layout/css/styles.css";
import "../react-grid-layout/css/example-styles.css";
import BoundedLayout from "./16-bounded";
export default {
  title: 'Example/BoundedLayout',
  Component: BoundedLayout,
};

const Template = (args) => <BoundedLayout {...args} />;

export const Example = Template.bind({});
Example.args = {

};
