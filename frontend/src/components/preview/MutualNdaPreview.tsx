interface Props {
  formValues: Record<string, string>;
}

function Field({ value, placeholder }: { value: string; placeholder: string }) {
  if (value.trim()) return <span className="font-medium">{value}</span>;
  return (
    <span className="bg-yellow-100 text-yellow-700 px-1 rounded text-sm">
      {placeholder}
    </span>
  );
}

function SignatureBlock({ partyName }: { partyName: string }) {
  return (
    <div className="mt-2">
      <p className="font-medium">{partyName || <span className="text-yellow-700">[Party Name]</span>}</p>
      <div className="mt-3 space-y-2 text-sm text-gray-700">
        <p>Signature: <span className="inline-block w-40 border-b border-gray-400">&nbsp;</span></p>
        <p>Name: <span className="inline-block w-44 border-b border-gray-400">&nbsp;</span></p>
        <p>Title: <span className="inline-block w-44 border-b border-gray-400">&nbsp;</span></p>
        <p>Date: <span className="inline-block w-44 border-b border-gray-400">&nbsp;</span></p>
      </div>
    </div>
  );
}

export default function MutualNdaPreview({ formValues }: Props) {
  const v = formValues;
  const period = v.confidentiality_period_years;

  return (
    <div className="font-serif text-sm text-gray-900 leading-relaxed space-y-4">
      <h1 className="text-center text-base font-bold uppercase tracking-wide">
        Mutual Non-Disclosure Agreement
      </h1>

      <p>
        This Mutual Non-Disclosure Agreement (&ldquo;Agreement&rdquo;) is entered into as of{" "}
        <Field value={v.effective_date} placeholder="Effective Date" /> between:
      </p>

      <p>
        <Field value={v.party_a_name} placeholder="Party A Name" />, having its principal place of
        business at <Field value={v.party_a_address} placeholder="Party A Address" /> (&ldquo;Party A&rdquo;);
      </p>

      <p>and</p>

      <p>
        <Field value={v.party_b_name} placeholder="Party B Name" />, having its principal place of
        business at <Field value={v.party_b_address} placeholder="Party B Address" /> (&ldquo;Party B&rdquo;).
      </p>

      <p>
        Party A and Party B are each referred to herein individually as a &ldquo;Party&rdquo; and
        collectively as the &ldquo;Parties&rdquo;.
      </p>

      <section>
        <h2 className="font-bold uppercase text-xs tracking-wide mt-4 mb-1">1. Purpose</h2>
        <p>
          The Parties wish to explore and engage in{" "}
          <Field value={v.purpose} placeholder="Purpose of Disclosure" /> (the &ldquo;Purpose&rdquo;). In
          connection with the Purpose, each Party may disclose to the other certain confidential
          information. Each Party agrees to receive such information subject to the terms and
          conditions of this Agreement.
        </p>
      </section>

      <section>
        <h2 className="font-bold uppercase text-xs tracking-wide mt-4 mb-1">
          2. Definition of Confidential Information
        </h2>
        <p>
          &ldquo;Confidential Information&rdquo; means any information or data disclosed by either
          Party (in such capacity, the &ldquo;Disclosing Party&rdquo;) to the other Party (in such
          capacity, the &ldquo;Receiving Party&rdquo;), whether orally, in writing, or by any other
          means, that is designated as confidential or that reasonably should be understood to be
          confidential given the nature of the information and circumstances of disclosure.
          Confidential Information includes, without limitation, business plans, financial data, trade
          secrets, technical information, product information, customer lists, and proprietary
          methodologies.
        </p>
      </section>

      <section>
        <h2 className="font-bold uppercase text-xs tracking-wide mt-4 mb-1">
          3. Mutual Obligations of Confidentiality
        </h2>
        <p>Each Party, in its capacity as a Receiving Party, agrees to:</p>
        <ol className="list-none pl-4 space-y-1 mt-1">
          <li>(a) hold all Confidential Information received from the other Party in strict confidence;</li>
          <li>(b) not disclose such Confidential Information to any third party without the prior written consent of the Disclosing Party;</li>
          <li>(c) use the Confidential Information solely for the Purpose;</li>
          <li>(d) protect the Confidential Information using at least the same degree of care it uses to protect its own confidential information, but in no event less than reasonable care;</li>
          <li>(e) limit access to the Confidential Information to those of its employees or contractors who have a need to know and who are bound by confidentiality obligations no less restrictive than those set forth herein.</li>
        </ol>
      </section>

      <section>
        <h2 className="font-bold uppercase text-xs tracking-wide mt-4 mb-1">4. Exclusions</h2>
        <p>The obligations in Section 3 do not apply to information that:</p>
        <ol className="list-none pl-4 space-y-1 mt-1">
          <li>(a) is or becomes publicly known through no breach of this Agreement by the Receiving Party;</li>
          <li>(b) was rightfully known to the Receiving Party prior to disclosure without restriction;</li>
          <li>(c) is rightfully received by the Receiving Party from a third party without restriction;</li>
          <li>(d) is independently developed by the Receiving Party without use of the Confidential Information; or</li>
          <li>(e) is required to be disclosed by applicable law or court order, provided the Receiving Party gives prompt written notice to the Disclosing Party and cooperates with efforts to seek a protective order.</li>
        </ol>
      </section>

      <section>
        <h2 className="font-bold uppercase text-xs tracking-wide mt-4 mb-1">5. Term</h2>
        <p>
          This Agreement shall remain in effect for a period of{" "}
          <Field value={period} placeholder="Confidentiality Period" />{" "}
          {period ? (Number(period) === 1 ? "year" : "years") : "years"} from the Effective Date.
          The obligations of confidentiality shall survive termination of this Agreement.
        </p>
      </section>

      <section>
        <h2 className="font-bold uppercase text-xs tracking-wide mt-4 mb-1">
          6. Return of Information
        </h2>
        <p>
          Upon written request by either Party, the other Party shall promptly return or destroy all
          Confidential Information received and any copies thereof.
        </p>
      </section>

      <section>
        <h2 className="font-bold uppercase text-xs tracking-wide mt-4 mb-1">7. No Licence</h2>
        <p>
          Nothing in this Agreement grants either Party any rights in the other Party&rsquo;s
          Confidential Information other than the limited right to use it for the Purpose.
        </p>
      </section>

      <section>
        <h2 className="font-bold uppercase text-xs tracking-wide mt-4 mb-1">8. Governing Law</h2>
        <p>
          This Agreement shall be governed by and construed in accordance with the laws of{" "}
          <Field value={v.governing_law} placeholder="Governing Law" />, and the Parties submit to
          the exclusive jurisdiction of the courts of that jurisdiction.
        </p>
      </section>

      <section>
        <h2 className="font-bold uppercase text-xs tracking-wide mt-4 mb-1">9. Entire Agreement</h2>
        <p>
          This Agreement constitutes the entire agreement between the Parties with respect to its
          subject matter and supersedes all prior negotiations, representations, and understandings.
        </p>
      </section>

      <p className="mt-4 text-xs uppercase tracking-wide font-bold">
        In Witness Whereof, the Parties have executed this Agreement as of the date first written
        above.
      </p>

      <div className="grid grid-cols-2 gap-8 mt-4">
        <SignatureBlock partyName={v.party_a_name} />
        <SignatureBlock partyName={v.party_b_name} />
      </div>
    </div>
  );
}
