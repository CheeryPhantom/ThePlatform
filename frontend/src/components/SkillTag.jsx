import './SkillTag.css';

const SkillTag = ({ skill, matchLevel }) => {
  const getTagClass = () => {
    switch (matchLevel) {
      case 'exact':
        return 'skill-tag skill-tag-exact';
      case 'strong':
        return 'skill-tag skill-tag-strong';
      case 'partial':
        return 'skill-tag skill-tag-partial';
      case 'learning':
        return 'skill-tag skill-tag-learning';
      default:
        return 'skill-tag skill-tag-learning';
    }
  };

  return (
    <span
      className={getTagClass()}
      title={matchLevel ? `${skill} - ${matchLevel} match` : skill}
    >
      {skill}
    </span>
  );
};

export default SkillTag;