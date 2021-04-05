import React from 'react';
import "../css/styles.css";
import "../css/example-styles.css";
import ScaledLayout from "./18-scale";

export default {
  title: 'Example/ScaledLayout',
  Component: ScaledLayout,
};

const Template = (args) => <ScaledLayout {...args} />;

export const Example = Template.bind({});
Example.args = {

};
