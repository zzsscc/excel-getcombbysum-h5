import React, { Component } from "react";
import { inject, observer } from "mobx-react";
import XLSX from "xlsx";
import { pickBy, trim, mapKeys } from "lodash";
import classNames from "classnames";
import {
  Form,
  Input,
  Switch,
  InputNumber,
  Upload,
  Button,
  message,
  Modal,
  Result,
} from "antd";
import { InboxOutlined, SmileOutlined, MehOutlined } from "@ant-design/icons";
import getCombBySum from "@/utils/getCombBySum";

import "./index.less";

const { Item } = Form;
const { Dragger } = Upload;

const initialValues = {
  useDefault: true,
  targetCount: 0,
  tolerance: 0,
  excelUrl: null,
  column: "A",
  startRow: 1,
  endRow: null,
  targetSum: 0,
};

@inject("commonConfigStore", "commonGlobalStore")
@observer
class Index extends Component {
  constructor(props) {
    super(props);
    this.formItemLayout = {
      labelCol: {
        xs: { span: 24 },
        sm: { span: 5 },
      },
      wrapperCol: {
        xs: { span: 24 },
        sm: { span: 12 },
      },
    };
  }

  componentDidMount() {
    this.forceUpdate();
  }

  normFile = (e) => {
    console.log("Upload event:", e);
    const { file } = e;
    const { status, name, response } = file;
    if (status !== "uploading") {
      console.log(file);
    }
    if (status === "done") {
      message.success(`${name} file uploaded successfully.`);
      return response.path;
    } else if (status === "error") {
      message.error(`${name} file upload failed.`);
    }
  };

  resetForm = () => {
    this.form.resetFields();
    this.forceUpdate();
  };

  onChange = (values) => {
    console.log("onChange", values);
    if (Object.keys(values)[0] === "column") {
      const { setFieldsValue } = this.form;
      setFieldsValue({
        column: trim(values.column)
          .replace(/[^a-zA-Z]*/gi, "")
          .toUpperCase(),
      });
    }
    this.forceUpdate();
  };

  onFinish = (values) => {
    console.log("onFinish", values);
    this.props.commonGlobalStore.loading = true;
    this.props.commonGlobalStore.loadingTips = "请稍候，完成后将下载xlsx";
    this.readWorkbookFromRemoteFile(
      this.form.getFieldValue("excelUrl"),
      this.calculation
    );
  };

  readWorkbookFromRemoteFile(url, callback) {
    const xhr = new XMLHttpRequest();
    xhr.open("get", url, true);
    xhr.responseType = "arraybuffer";
    xhr.onload = () => {
      if (xhr.status === 200) {
        const data = new Uint8Array(xhr.response);
        const workbook = XLSX.read(data, { type: "array" });
        if (callback) callback(workbook);
      }
    };
    xhr.send();
  }

  calculation = async (workbook) => {
    const {
      column: handleColumnKey,
      startRow,
      endRow,
      targetSum,
      targetCount,
      tolerance,
    } = this.form.getFieldsValue();
    try {
      const sheetNames = workbook.SheetNames; // 工作表名称集合
      const worksheet = workbook.Sheets[sheetNames[0]]; // 这里我们只读取第一张sheet
      // 1、pickBy获取匹配选择列数据集合{A1: {}, A2: {}, ...}，2、mapKeys去掉key中的字母（A2 => 2） {1: {}, 2: {}, ...}
      const worksheetColumn = mapKeys(
        pickBy(worksheet, (value, key) => {
          const reg = new RegExp(`(${handleColumnKey})([0-9]+)`);
          return reg.test(key);
        }),
        (value, key) => {
          return +key.replace(handleColumnKey, "");
        }
      );
      // 获取选择列最大行标 number
      const autoColumnEndRow = Math.max(...Object.keys(worksheetColumn));
      // 获取最终需要进行组合的数集合，过滤非数字
      const nums = Object.entries(worksheetColumn)
        .map(([key, value]) => {
          if (
            key >= startRow &&
            key <= (endRow || autoColumnEndRow) &&
            +value.v
          ) {
            return +value.v;
          }
          return null;
        })
        .filter((d) => d);
      console.log(nums, targetSum, targetCount, tolerance);
      const result = await new getCombBySum(
        nums,
        targetSum,
        targetCount,
        tolerance
      );
      console.log("结果集:", result);
      if (!result || !result.length) {
        return this.handleFaceBack({
          icon: null,
          content: <Result icon={<MehOutlined />} title="什么也没有!" />,
        });
      }
      this.downloadXlsx(result);
      // [
      //   [152, 167, 174, 186, 193, 196, 215, 225, 228, 232, 250, 278, 291, 303, 344, 405, 431, 661, 954, 1032, 1204],
      //   [152, 167, 174, 186, 196, 215, 225, 228, 232, 250, 278, 291, 344, 360, 405, 661, 728, 793, 1032, 1208],
      //   [152, 167, 174, 186, 193, 196, 215, 225, 232, 250, 291, 360, 405, 431, 661, 793, 954, 1032, 1208],
      //   [152, 167, 174, 186, 193, 196, 215, 250, 278, 291, 303, 344, 661, 728, 793, 954, 1032, 1208],
      //   [152, 167, 174, 186, 193, 215, 232, 250, 344, 405, 431, 661, 728, 793, 954, 1032, 1208],
      //   [152, 167, 174, 193, 232, 291, 344, 360, 405, 431, 661, 728, 793, 954, 1032, 1208],
      //   [193, 215, 232, 278, 291, 344, 360, 405, 431, 661, 728, 793, 954, 1032, 1208]
      // ]
    } catch (e) {
      console.error("readWorkbookFromRemoteFile error", e);
      message.error(String(e));
    } finally {
      this.props.commonGlobalStore.loading = false;
    }
  };

  downloadXlsx = (data) => {
    try {
      const filename = "result.xlsx"; // 文件名称
      /**
       * 直接new Array(length).fill([])填充的话其中填充的数组为共用内存地址，故多一步map转化
       */
      const witerData = new Array(Math.max(...data.map((d) => d.length)))
        .fill(0)
        .map(() => []);
      data.forEach((d, i) => {
        d.forEach((u, j) => {
          witerData[j][i] = u;
        });
      });
      const ws_name = "Sheet1"; // Excel第一个sheet的名称
      const wb = XLSX.utils.book_new();
      const ws = XLSX.utils.aoa_to_sheet(witerData);
      XLSX.utils.book_append_sheet(wb, ws, ws_name); // 将数据添加到工作薄
      XLSX.writeFile(wb, filename); // 导出Excel
    } catch (e) {
      throw e;
    }
  };

  handleFaceBack = (config) => {
    const modal = Modal.info();
    modal.update((prevConfig) => ({
      ...prevConfig,
      ...config,
    }));
  };

  render() {
    const { getFieldValue } = this.form || {};
    return (
      <>
        <Form
          name="validate"
          ref={(el) => (this.form = el)}
          {...this.formItemLayout}
          onFinish={this.onFinish}
          onValuesChange={this.onChange}
          initialValues={initialValues}
        >
          <Item
            name="useDefault"
            label="是否使用默认配置"
            valuePropName="checked"
            extra={
              getFieldValue &&
              getFieldValue("useDefault") &&
              `默认操作数：${getFieldValue(
                "targetCount"
              )}，容差：${getFieldValue("tolerance")}`
            }
          >
            <Switch />
          </Item>
          <Item
            label="操作数"
            className={classNames({
              fly: getFieldValue && getFieldValue("useDefault"),
            })}
          >
            <span className="ant-form-text">由</span>
            <Item name="targetCount" noStyle>
              <InputNumber min={0} />
            </Item>
            <span className="ant-form-text">个数字组成</span>
          </Item>
          <Item
            label="容差"
            className={classNames({
              fly: getFieldValue && getFieldValue("useDefault"),
            })}
          >
            <span className="ant-form-text">误差</span>
            <Item name="tolerance" noStyle>
              <InputNumber min={0} />
            </Item>
            <span className="ant-form-text">以内都没关系</span>
          </Item>
          <Item label="上传excel">
            <Item
              name="excelUrl"
              valuePropName="file"
              getValueFromEvent={this.normFile}
              noStyle
              rules={[{ required: true, message: "excel必传！" }]}
            >
              <Dragger
                name="file"
                action="https://niu.souche.com/upload/aliyun"
              >
                <p className="ant-upload-drag-icon">
                  <InboxOutlined />
                </p>
                <p className="ant-upload-text">
                  Click or drag file to this area to upload
                </p>
                <p className="ant-upload-hint">
                  Support for a single or bulk upload. Strictly prohibit from
                  uploading company data or other band files
                </p>
              </Dragger>
            </Item>
          </Item>
          <Item label="取哪列的数据">
            <Item
              name="column"
              noStyle
              hasFeedback
              rules={[{ required: true, message: "取哪列的数据必填!" }]}
            >
              <Input />
            </Item>
          </Item>
          <Item label="行" className="row">
            <Item
              name="startRow"
              noStyle
              hasFeedback
              rules={[{ required: true, message: "从第几行开始必填!" }]}
            >
              <InputNumber
                min={0}
                placeholder="从第几行开始"
                style={{ width: "calc(50% - 5px)" }}
              />
            </Item>
            <Item name="endRow" noStyle>
              <InputNumber
                min={0}
                placeholder="到第几行结束"
                style={{ marginLeft: "10px", width: "calc(50% - 5px)" }}
              />
            </Item>
            <span
              className="ant-form-text"
              style={{ whiteSpace: "nowrap", alignSelf: "center" }}
            >
              不填默认到底
            </span>
          </Item>
          <Item label="目标总值">
            <Item
              name="targetSum"
              noStyle
              hasFeedback
              rules={[{ required: true, message: "目标总值必填!" }]}
            >
              <InputNumber />
            </Item>
          </Item>
          <Item wrapperCol={{ span: 12, offset: 5 }} className="action">
            <Button type="primary" htmlType="submit">
              Submit
            </Button>
            <Button type="primary" onClick={this.resetForm}>
              重置
            </Button>
          </Item>
        </Form>
      </>
    );
  }
}

export default Index;
