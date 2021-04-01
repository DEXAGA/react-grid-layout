import React from 'react';
import "../react-grid-layout/css/styles.css";
import "../react-grid-layout/css/example-styles.css";
import GridPropertyLayout from "./4-grid-property";
export default {
  title: 'Example/GridPropertyLayout',
  Component: GridPropertyLayout,
};

const Template = (args) => <GridPropertyLayout {...args} />;

export const Example = Template.bind({});
Example.args = {

};
