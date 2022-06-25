|%
+$  sheet  $:(meta=sheet-meta data=(map address sell))
+$  sheet-meta  $:
  id=@uw
  title=path
  owner=@p
  tags=(set tag)
  row-meta=(map @ud (set row-visual))
  column-meta=(map @ud (set column-visual))
  row-count=@ud
  column-count=@ud
  =whitelist
  last-modified=@da
  ==
+$  address  [row-address=@ud column-address=@ud]
+$  tag  @t
+$  sell  [meta=sell-meta data=sell-data]
+$  sell-meta  (set visual)
+$  sell-data  [input=@t output=@t]
+$  visual  $%
  [%bold ?]
  [%italic ?]
  [%underline ?]
  [%monospace ?]
  [%strikethrough ?]
  [%foreground tape]
  [%background tape]
  [%size @ud]
  [%font tape]
  ==
+$  row-visual  $%
  [%base visual]
  [%alte height]
  ==
+$  column-visual  $%
  [%base visual]
  [%alte width]
  ==
+$  height  @ud
+$  width  @ud
+$  whitelist  (map @p access)
+$  access  ?(%read %write)
--