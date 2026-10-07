import useReveal from '../hooks/useReveal';

export default function Reveal({ as: Tag = 'div', className = '', children, delay = 0, ...rest }) {
  const ref = useReveal();
  return (
    <Tag ref={ref} className={`reveal group ${className}`} style={delay ? { transitionDelay: `${delay}ms` } : undefined} {...rest}>
      {children}
    </Tag>
  );
}
