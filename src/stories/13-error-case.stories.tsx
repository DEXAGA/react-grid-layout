import React from 'react';
import "../react-grid-layout/css/styles.css";
import "../react-grid-layout/css/example-styles.css";
import ErrorCaseLayout from "./13-error-case";
export default {
  title: 'Example/ErrorCaseLayout',
  Component: ErrorCaseLayout,
};

const Template = (args) => <ErrorCaseLayout {...args} />;

export const Example = Template.bind({});
Example.args = {

};
