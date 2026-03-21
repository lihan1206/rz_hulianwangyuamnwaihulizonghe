import { Component } from "react";
import { Button, Result } from "antd";

export class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch() {}

  render() {
    if (this.state.hasError) {
      return (
        <div className="error-wrap">
          <Result
            status="500"
            title="页面暂时出了点问题"
            subTitle="请刷新页面后重试，当前数据不会丢失。"
            extra={
              <Button
                type="primary"
                onClick={() => {
                  this.setState({ hasError: false });
                  window.location.reload();
                }}
              >
                重新加载
              </Button>
            }
          />
        </div>
      );
    }
    return this.props.children;
  }
}
