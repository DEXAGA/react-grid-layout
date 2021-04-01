import React from 'react';
import "../react-grid-layout/css/styles.css";
import "../react-grid-layout/css/example-styles.css";
import NoCollisionLayout from "./12-prevent-collision";
export default {
  title: 'Example/NoCollisionLayout',
  Component: NoCollisionLayout,
};

const Template = (args) => <NoCollisionLayout {...args} />;

export const Example = Template.bind({});
Example.args = {

};
