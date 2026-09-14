import PageHeading from 'shared/components/PageHeading';
import React from 'react';
import { RULES_SECTIONS } from 'shared/content/gameGuideContent';

const GameRule = ({ embedded = false }) => {
    return (
        <div className='cms-page'>
            {!embedded && <PageHeading title='Rules' eyebrow='21 Holdem' icon='book' as='h1' />}
            <div className="cms-content">
                {RULES_SECTIONS.map(section => (
                    <div key={section.title}>
                        <p className='content-title'>{section.title}</p>
                        {section.paragraphs?.map(paragraph => (
                            <p key={paragraph}>{paragraph}</p>
                        ))}
                        {section.bullets?.length ? (
                            <ul>
                                {section.bullets.map(item => (
                                    <li key={item}>{item}</li>
                                ))}
                            </ul>
                        ) : null}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default GameRule;
