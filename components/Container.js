const Container = ({ children }) => (
  <div className="container">
    {children}
    <style jsx>{`
      .container {
        box-sizing: content-box;

        width: 100%;
        max-width: 544px; // re-sized Canvas (1080px / 2) + both left and right 2px borders

        margin: 0 auto;
        padding: 1rem;
      }
    `}</style>
  </div>
);
export default Container;
