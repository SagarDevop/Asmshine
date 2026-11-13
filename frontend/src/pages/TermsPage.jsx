import React from 'react';
import { LegalPolicyPage } from './LegalPolicyPage';

export const TermsPage = () => {
  return (
    <LegalPolicyPage
      policyType="terms_and_conditions"
      fallbackTitle="Terms & Conditions"
    />
  );
};
export default TermsPage;

