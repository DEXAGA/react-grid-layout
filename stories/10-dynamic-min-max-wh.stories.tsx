import React from 'react';
import "../css/styles.css";
import "../css/example-styles.css";
import DynamicMinMaxLayout from "./10-dynamic-min-max-wh";
export default {
  title: 'Example/DynamicMinMaxLayout',
  Component: DynamicMinMaxLayout,
};

const Template = (args) => <DynamicMinMaxLayout {...args} />;

export const Example = Template.bind({});
Example.args = {

};
