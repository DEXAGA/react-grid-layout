import React from 'react';
import "../css/styles.css";
import "../css/example-styles.css";
import ToolboxLayout from "./14-toolbox";
export default {
  title: 'Example/ToolboxLayout',
  Component: ToolboxLayout,
};

const Template = (args) => <ToolboxLayout {...args} />;

export const Example = Template.bind({});
Example.args = {

};
