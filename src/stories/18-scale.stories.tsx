import React from 'react';
import "../react-grid-layout/css/styles.css";
import "../react-grid-layout/css/example-styles.css";
import ScaledLayout from "./18-scale";

export default {
  title: 'Example/ScaledLayout',
  Component: ScaledLayout,
};

const Template = (args) => <ScaledLayout {...args} />;

export const Example = Template.bind({});
Example.args = {

};
