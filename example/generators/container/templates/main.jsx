import React from 'react'
import { connect } from 'react-redux'

function <%= componentName %>(props) {
  return (
    <div className="<%= componentName %>"></div>
  )
}

const mapStateToProps = (state) => {
  return {}
}

const mapDispatchToProps = (dispatch) => {
  return {}
}

export default connect(mapStateToProps, mapDispatchToProps)(<%= componentName %>)
